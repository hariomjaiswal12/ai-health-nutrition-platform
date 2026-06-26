const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFGenerator {
  // Generate Diet Plan PDF
  static async generateDietPlanPDF(dietPlan, patient, doctor, foods) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(24).fillColor('#2C5F2D').text('Swasthya Sutra', { align: 'center' });
        doc.fontSize(12).fillColor('#666').text('Ayurvedic Health Management Platform', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2C5F2D');
        doc.moveDown(1);

        // Title
        doc.fontSize(18).fillColor('#000').text('Personalized Diet Plan', { align: 'center' });
        doc.moveDown(1);

        // Patient Information Section
        doc.fontSize(14).fillColor('#2C5F2D').text('Patient Information');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#000');
        doc.text(`Name: ${patient.name}`);
        doc.text(`Age: ${patient.age} years | Gender: ${patient.gender}`);
        doc.text(`Phone: ${patient.phone}`);
        doc.text(`Diagnosis: ${patient.diagnosis}`);
        doc.moveDown(1);

        // Doctor Information
        doc.fontSize(14).fillColor('#2C5F2D').text('Prescribed By');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#000');
        doc.text(`Dr. ${doctor.username}`);
        doc.text(`Email: ${doctor.email}`);
        doc.moveDown(1);

        // Diet Plan Details
        doc.fontSize(14).fillColor('#2C5F2D').text('Diet Plan Details');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#000');
        doc.text(`Meal Time: ${dietPlan.mealTime}`);
        doc.text(`Rasa (Taste): ${dietPlan.rasa || 'Balanced'}`);
        doc.text(`Dosha Balance: ${dietPlan.doshaBalance || 'All Doshas'}`);
        doc.moveDown(0.5);

        // Recommended Foods Table
        doc.fontSize(14).fillColor('#2C5F2D').text('Recommended Foods');
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const tableHeaders = ['Food Name', 'Category', 'Benefits'];
        const colWidths = [150, 100, 250];
        let x = 50;

        // Table Headers
        doc.fontSize(10).fillColor('#fff');
        doc.rect(50, tableTop, 500, 20).fill('#2C5F2D');
        tableHeaders.forEach((header, i) => {
          doc.text(header, x + 5, tableTop + 5, { width: colWidths[i] });
          x += colWidths[i];
        });

        // Table Rows
        doc.fillColor('#000');
        let y = tableTop + 25;
        
        foods.forEach((food, index) => {
          if (y > 700) { // New page if needed
            doc.addPage();
            y = 50;
          }
          
          const rowHeight = Math.max(
            doc.heightOfString(food.name, { width: colWidths[0] - 10 }),
            doc.heightOfString(food.category, { width: colWidths[1] - 10 }),
            doc.heightOfString(food.benefits, { width: colWidths[2] - 10 })
          ) + 10;

          // Alternate row colors
          if (index % 2 === 0) {
            doc.rect(50, y, 500, rowHeight).fill('#f9f9f9');
          }

          doc.fillColor('#000');
          doc.text(food.name, 55, y + 5, { width: colWidths[0] - 10 });
          doc.text(food.category, 205, y + 5, { width: colWidths[1] - 10 });
          doc.text(food.benefits, 305, y + 5, { width: colWidths[2] - 10 });
          
          y += rowHeight;
        });

        doc.moveDown(2);

        // Notes Section
        if (dietPlan.notes) {
          doc.fontSize(14).fillColor('#2C5F2D').text('Additional Notes');
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#000').text(dietPlan.notes);
          doc.moveDown(1);
        }

        // Footer
        doc.fontSize(9).fillColor('#666');
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 50, doc.page.height - 50, { align: 'center' });
        doc.text('This diet plan is based on Ayurvedic principles. Consult your healthcare provider for personalized advice.', 50, doc.page.height - 35, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate Patient Report PDF
  static async generatePatientReportPDF(patient, dietPlans, foods) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        doc.fontSize(24).fillColor('#2C5F2D').text('Swasthya Sutra', { align: 'center' });
        doc.fontSize(12).fillColor('#666').text('Patient Consultation Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2C5F2D');
        doc.moveDown(1);

        // Patient Details
        doc.fontSize(16).fillColor('#2C5F2D').text('Patient Information');
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000');
        doc.text(`Name: ${patient.name}`);
        doc.text(`Age: ${patient.age} years`);
        doc.text(`Gender: ${patient.gender}`);
        doc.text(`Phone: ${patient.phone}`);
        doc.text(`Patient ID: ${patient._id}`);
        doc.moveDown(1);

        // Diagnosis
        doc.fontSize(16).fillColor('#2C5F2D').text('Diagnosis');
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000').text(patient.diagnosis);
        doc.moveDown(1);

        // Diet Plans Summary
        doc.fontSize(16).fillColor('#2C5F2D').text('Prescribed Diet Plans');
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000');
        
        if (dietPlans.length === 0) {
          doc.text('No diet plans prescribed yet.');
        } else {
          dietPlans.forEach((plan, index) => {
            doc.fontSize(13).fillColor('#2C5F2D').text(`${index + 1}. ${plan.mealTime}`);
            doc.fontSize(11).fillColor('#000');
            doc.text(`   Foods: ${plan.foods.join(', ')}`);
            doc.text(`   Rasa: ${plan.rasa || 'Balanced'}`);
            doc.text(`   Dosha Balance: ${plan.doshaBalance || 'All Doshas'}`);
            if (plan.notes) {
              doc.text(`   Notes: ${plan.notes}`);
            }
            doc.moveDown(0.5);
          });
        }

        doc.moveDown(1);

        // Footer
        doc.fontSize(9).fillColor('#666');
        doc.text(`Report Generated: ${new Date().toLocaleString('en-IN')}`, 50, doc.page.height - 50, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;
