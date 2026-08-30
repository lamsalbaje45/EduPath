import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDatabase } from './config/database.js';
import { College } from './models/college.js';
import { OnlineClass } from './models/onlineClass.js';
import { Opportunity } from './models/opportunity.js';
import { User } from './models/user.js';
import { colleges, onlineClasses, opportunities, sampleUsers } from './seeds/initialData.js';

dotenv.config();

const DEFAULT_SEED_PASSWORD = 'ChangeMe123!';

function toUserUpdate(user, passwordHash) {
    return {
        updateOne: {
            filter: { email: user.email },
            update: {
                $set: {
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    accountStatus: 'active',
                    emailVerified: user.emailVerified,
                    studentProfile: user.studentProfile,
                },
                // Existing seed users retain a password that may have been changed
                // after their first seed. A hash is only stored on insertion.
                $setOnInsert: { passwordHash },
            },
            upsert: true,
        },
    };
}

function toCatalogUpdate(record, ownerField, owner) {
    const { identity, ownerEmail, employerEmail, ...document } = record;

    return {
        updateOne: {
            filter: identity,
            update: { $set: { ...document, [ownerField]: owner } },
            upsert: true,
        },
    };
}

async function seedUsers() {
    const password = process.env.SEED_USER_PASSWORD || DEFAULT_SEED_PASSWORD;
    const passwordHash = await bcrypt.hash(password, 12);

    await User.bulkWrite(sampleUsers.map((user) => toUserUpdate(user, passwordHash)));

    const users = await User.find({ email: { $in: sampleUsers.map((user) => user.email) } })
        .select('_id email')
        .lean();

    const usersByEmail = new Map(users.map((user) => [user.email, user._id]));

    if (usersByEmail.size !== sampleUsers.length) {
        throw new Error('Unable to create or retrieve every sample user.');
    }

    return usersByEmail;
}

function getUserId(usersByEmail, email) {
    const userId = usersByEmail.get(email);

    if (!userId) {
        throw new Error(`Seed owner ${email} was not found.`);
    }

    return userId;
}

async function seedCatalog(usersByEmail) {
    await College.bulkWrite(
        colleges.map((college) => toCatalogUpdate(college, 'owner', getUserId(usersByEmail, college.ownerEmail)))
    );

    await Opportunity.bulkWrite(
        opportunities.map((opportunity) => toCatalogUpdate(opportunity, 'employer', getUserId(usersByEmail, opportunity.employerEmail)))
    );

    await OnlineClass.bulkWrite(
        onlineClasses.map((onlineClass) => toCatalogUpdate(onlineClass, 'owner', getUserId(usersByEmail, onlineClass.ownerEmail)))
    );

    const [college, opportunity, onlineClass] = await Promise.all([
        College.findOne(colleges[0].identity).select('_id').lean(),
        Opportunity.findOne(opportunities[0].identity).select('_id').lean(),
        OnlineClass.findOne(onlineClasses[0].identity).select('_id').lean(),
    ]);

    if (!college || !opportunity || !onlineClass) {
        throw new Error('Unable to retrieve seeded catalog records.');
    }

    await User.updateOne(
        { email: 'student@edupath.local' },
        {
            $set: {
                'studentProfile.savedColleges': [college._id],
                'studentProfile.savedOpportunities': [opportunity._id],
                'studentProfile.savedClasses': [onlineClass._id],
            },
        }
    );
}

async function seedDatabase() {
    await connectDatabase();

    const usersByEmail = await seedUsers();
    await seedCatalog(usersByEmail);

    console.log(`Seed complete: ${sampleUsers.length} users, ${colleges.length} colleges, ${opportunities.length} opportunities, and ${onlineClasses.length} online classes are ready.`);
    console.log('New sample users use SEED_USER_PASSWORD, or the development default ChangeMe123!.');
}

try {
    await seedDatabase();
} catch (error) {
    console.error('Database seed failed.');
    console.error(error.message);
    process.exitCode = 1;
} finally {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
}
