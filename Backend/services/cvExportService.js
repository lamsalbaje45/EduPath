/**
 * CV Export Service
 * Handles CV data export to various formats (JSON, PDF, etc.)
 */

/**
 * Export CV data to JSON format
 * @param {Object} cvData - CV data object
 * @returns {string} JSON string of CV data
 */
export function exportToJSON(cvData) {
    try {
        return JSON.stringify(cvData, null, 2);
    } catch (error) {
        console.error('Error exporting CV to JSON:', error);
        throw error;
    }
}

/**
 * Export CV data to HTML format
 * @param {Object} cvData - CV data object
 * @returns {string} HTML string of CV
 */
export function exportToHTML(cvData) {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${cvData.fullName} - CV</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #007bff; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .contact-info { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
        .section { margin-bottom: 20px; }
        .entry { margin-bottom: 15px; }
        .entry-title { font-weight: bold; color: #333; }
        .entry-subtitle { color: #666; font-style: italic; }
        .entry-description { margin-top: 5px; }
    </style>
</head>
<body>
    <h1>${cvData.fullName || 'CV'}</h1>
    
    <div class="contact-info">
        ${cvData.email ? `<p>Email: ${cvData.email}</p>` : ''}
        ${cvData.phoneNumber ? `<p>Phone: ${cvData.phoneNumber}</p>` : ''}
        ${cvData.location ? `<p>Location: ${cvData.location}</p>` : ''}
        ${cvData.website ? `<p>Website: <a href="${cvData.website}">${cvData.website}</a></p>` : ''}
    </div>

    ${cvData.summary ? `
    <div class="section">
        <h2>Professional Summary</h2>
        <p>${cvData.summary}</p>
    </div>
    ` : ''}

    ${cvData.skills && cvData.skills.length > 0 ? `
    <div class="section">
        <h2>Skills</h2>
        <ul>
            ${cvData.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    ${cvData.experience && cvData.experience.length > 0 ? `
    <div class="section">
        <h2>Experience</h2>
        ${cvData.experience.map(exp => `
        <div class="entry">
            <div class="entry-title">${exp.jobTitle}</div>
            <div class="entry-subtitle">${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})</div>
            <div class="entry-description">${exp.description || ''}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${cvData.education && cvData.education.length > 0 ? `
    <div class="section">
        <h2>Education</h2>
        ${cvData.education.map(edu => `
        <div class="entry">
            <div class="entry-title">${edu.degree}</div>
            <div class="entry-subtitle">${edu.institution} (${edu.year})</div>
            ${edu.details ? `<div class="entry-description">${edu.details}</div>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${cvData.certifications && cvData.certifications.length > 0 ? `
    <div class="section">
        <h2>Certifications</h2>
        <ul>
            ${cvData.certifications.map(cert => `<li>${cert}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <p style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
        Exported from EduPath on ${new Date().toLocaleDateString()}
    </p>
</body>
</html>
        `;
        return html;
    } catch (error) {
        console.error('Error exporting CV to HTML:', error);
        throw error;
    }
}

/**
 * Export CV data to CSV format (simplified)
 * @param {Object} cvData - CV data object
 * @returns {string} CSV string
 */
export function exportToCSV(cvData) {
    try {
        let csv = 'Field,Value\n';

        // Add basic information
        csv += `"Full Name","${cvData.fullName || ''}"\n`;
        csv += `"Email","${cvData.email || ''}"\n`;
        csv += `"Phone","${cvData.phoneNumber || ''}"\n`;
        csv += `"Location","${cvData.location || ''}"\n`;

        // Add skills
        if (cvData.skills && cvData.skills.length > 0) {
            csv += `"Skills","${cvData.skills.join('; ')}"\n`;
        }

        // Add experience
        if (cvData.experience && cvData.experience.length > 0) {
            csv += '\n"Experience Details"\n';
            cvData.experience.forEach(exp => {
                csv += `"${exp.company}","${exp.jobTitle}","${exp.startDate} - ${exp.endDate || 'Present'}"\n`;
            });
        }

        // Add education
        if (cvData.education && cvData.education.length > 0) {
            csv += '\n"Education Details"\n';
            cvData.education.forEach(edu => {
                csv += `"${edu.institution}","${edu.degree}","${edu.year}"\n`;
            });
        }

        return csv;
    } catch (error) {
        console.error('Error exporting CV to CSV:', error);
        throw error;
    }
}

/**
 * Export CV data to PDF format (requires pdfkit or similar library)
 * This is a placeholder - implement with pdfkit or other PDF library
 * @param {Object} cvData - CV data object
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function exportToPDF(cvData) {
    try {
        // TODO: Implement PDF export using pdfkit or similar library
        // This requires: npm install pdfkit
        // Example implementation would use PDFDocument to create a formatted PDF
        throw new Error('PDF export not yet implemented. Install pdfkit and implement this method.');
    } catch (error) {
        console.error('Error exporting CV to PDF:', error);
        throw error;
    }
}

/**
 * Format CV data for display
 * @param {Object} cvData - Raw CV data
 * @returns {Object} Formatted CV data
 */
export function formatCVForDisplay(cvData) {
    try {
        return {
            fullName: cvData.fullName || '',
            email: cvData.email || '',
            phoneNumber: cvData.phoneNumber || '',
            location: cvData.location || '',
            website: cvData.website || '',
            summary: cvData.summary || '',
            skills: cvData.skills || [],
            experience: (cvData.experience || []).map(exp => ({
                company: exp.company || '',
                jobTitle: exp.jobTitle || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || 'Present',
                description: exp.description || '',
            })),
            education: (cvData.education || []).map(edu => ({
                institution: edu.institution || '',
                degree: edu.degree || '',
                year: edu.year || '',
                details: edu.details || '',
            })),
            certifications: cvData.certifications || [],
            lastUpdated: cvData.updatedAt || new Date(),
        };
    } catch (error) {
        console.error('Error formatting CV for display:', error);
        throw error;
    }
}

/**
 * Validate CV data structure
 * @param {Object} cvData - CV data to validate
 * @returns {Object} Validation result
 */
export function validateCVData(cvData) {
    const errors = [];

    if (!cvData.fullName || cvData.fullName.trim() === '') {
        errors.push('Full name is required');
    }

    if (!cvData.email || cvData.email.trim() === '') {
        errors.push('Email is required');
    }

    if (cvData.skills && !Array.isArray(cvData.skills)) {
        errors.push('Skills must be an array');
    }

    if (cvData.experience) {
        if (!Array.isArray(cvData.experience)) {
            errors.push('Experience must be an array');
        } else {
            cvData.experience.forEach((exp, index) => {
                if (!exp.company || !exp.jobTitle) {
                    errors.push(`Experience entry ${index + 1} must have company and job title`);
                }
            });
        }
    }

    if (cvData.education) {
        if (!Array.isArray(cvData.education)) {
            errors.push('Education must be an array');
        } else {
            cvData.education.forEach((edu, index) => {
                if (!edu.institution || !edu.degree) {
                    errors.push(`Education entry ${index + 1} must have institution and degree`);
                }
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
