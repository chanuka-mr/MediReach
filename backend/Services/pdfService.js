const puppeteer = require('puppeteer');
const htmlPdf = require('html-pdf');
const path = require('path');

// ─── PDF Generation Service ─────────────────────────────────────────────────────

class PDFService {
    static async generateInventoryPDF(reportData) {
        try {
            // First try with html-pdf (simpler, no Chrome required)
            return await this.generatePDFWithHtmlPdf(reportData);
        } catch (error) {
            console.log('html-pdf failed, trying Puppeteer:', error.message);
            try {
                // Fallback to Puppeteer if html-pdf fails
                return await this.generatePDFWithPuppeteer(reportData);
            } catch (puppeteerError) {
                console.error('Both PDF methods failed:', puppeteerError);
                throw new Error(`Failed to generate PDF: ${puppeteerError.message}`);
            }
        }
    }

    static async generatePDFWithHtmlPdf(reportData) {
        return new Promise((resolve, reject) => {
            const html = this.createInventoryReportHTML(reportData);
            
            const options = {
                format: 'A4',
                orientation: 'portrait',
                border: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                header: {
                    height: '20mm',
                    contents: '<div style="font-size: 10px; color: #666; text-align: center; width: 100%;">MediReach Inventory Report</div>'
                },
                footer: {
                    height: '20mm',
                    contents: '<div style="font-size: 10px; color: #666; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
                }
            };

            htmlPdf.create(html, options).toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            });
        });
    }

    static async generatePDFWithPuppeteer(reportData) {
        let browser;
        try {
            const launchOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            };

            browser = await puppeteer.launch(launchOptions);
            const page = await browser.newPage();
            
            const html = this.createInventoryReportHTML(reportData);
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                displayHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                        MediReach Inventory Report
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                    </div>
                `
            });
            
            await browser.close();
            return pdfBuffer;
            
        } catch (error) {
            if (browser) await browser.close();
            throw error;
        }
    }
    
    static createInventoryReportHTML(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #023E8A; 
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #023E8A; 
                    margin: 0; 
                    font-size: 28px;
                }
                .header p { 
                    color: #666; 
                    margin: 5px 0 0 0; 
                    font-size: 14px;
                }
                .summary { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 30px;
                }
                .summary-card { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 8px; 
                    border-left: 4px solid #023E8A;
                }
                .summary-card h3 { 
                    margin: 0 0 10px 0; 
                    color: #023E8A; 
                    font-size: 16px;
                }
                .summary-card .value { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #333;
                }
                .summary-card .label { 
                    font-size: 12px; 
                    color: #666; 
                    text-transform: uppercase;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left; 
                    font-size: 12px;
                }
                th { 
                    background-color: #023E8A; 
                    color: white; 
                    font-weight: bold;
                }
                tr:nth-child(even) { 
                    background-color: #f9f9f9;
                }
                .status-badge { 
                    padding: 4px 8px; 
                    border-radius: 12px; 
                    font-size: 10px; 
                    font-weight: bold;
                }
                .status-in-stock { 
                    background: #d4edda; 
                    color: #155724;
                }
                .status-low-stock { 
                    background: #fff3cd; 
                    color: #856404;
                }
                .status-out-of-stock { 
                    background: #f8d7da; 
                    color: #721c24;
                }
                .section-title { 
                    color: #023E8A; 
                    border-bottom: 1px solid #ddd; 
                    padding-bottom: 5px; 
                    margin: 30px 0 15px 0;
                }
                .pharmacy-breakdown { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                    gap: 15px; 
                    margin-bottom: 30px;
                }
                .pharmacy-card { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 8px; 
                    border: 1px solid #ddd;
                }
                .pharmacy-card h4 { 
                    margin: 0 0 10px 0; 
                    color: #023E8A;
                }
                @media print {
                    body { margin: 0; }
                    .summary { break-inside: avoid; }
                    table { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${data.title}</h1>
                <p>Generated on: ${new Date(data.generatedAt).toLocaleDateString()}</p>
                ${data.filters.pharmacy ? `<p>Pharmacy: ${data.filters.pharmacy}</p>` : ''}
                ${data.filters.category ? `<p>Category: ${data.filters.category}</p>` : ''}
            </div>
            
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Medicines</h3>
                    <div class="value">${data.summary.totalMedicines}</div>
                    <div class="label">Items</div>
                </div>
                <div class="summary-card">
                    <h3>Total Value</h3>
                    <div class="value">$${data.summary.totalValue.toFixed(2)}</div>
                    <div class="label">Inventory Value</div>
                </div>
                <div class="summary-card">
                    <h3>Low Stock Items</h3>
                    <div class="value">${data.summary.lowStockItems}</div>
                    <div class="label">Need Reorder</div>
                </div>
                <div class="summary-card">
                    <h3>Expired Items</h3>
                    <div class="value">${data.summary.expiredItems}</div>
                    <div class="label">Expired</div>
                </div>
            </div>
            
            <h2 class="section-title">Pharmacy Breakdown</h2>
            <div class="pharmacy-breakdown">
                ${Object.entries(data.pharmacyBreakdown).map(([pharmacy, stats]) => `
                    <div class="pharmacy-card">
                        <h4>${pharmacy}</h4>
                        <p><strong>Items:</strong> ${stats.count}</p>
                        <p><strong>Value:</strong> $${stats.totalValue.toFixed(2)}</p>
                        <p><strong>Low Stock:</strong> ${stats.lowStock}</p>
                        <p><strong>Expired:</strong> ${stats.expired}</p>
                    </div>
                `).join('')}
            </div>
            
            <h2 class="section-title">Medicine Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Pharmacy</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Value</th>
                        <th>Status</th>
                        <th>Expiry</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.medicines.map(med => `
                        <tr>
                            <td>${med.name}</td>
                            <td>${med.category}</td>
                            <td>${med.pharmacy}</td>
                            <td>$${med.price.toFixed(2)}</td>
                            <td>${med.stock}</td>
                            <td>$${med.value.toFixed(2)}</td>
                            <td>
                                <span class="status-badge ${med.stockStatus === 'In Stock' ? 'status-in-stock' : med.stockStatus === 'Low Stock' ? 'status-low-stock' : 'status-out-of-stock'}">
                                    ${med.stockStatus}
                                </span>
                            </td>
                            <td>${new Date(med.expiryDate).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>`;
    }
    
    static async generateExpiryPDF(reportData) {
        try {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            
            const html = this.createExpiryReportHTML(reportData);
            
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                }
            });
            
            await browser.close();
            return pdfBuffer;
            
        } catch (error) {
            console.error('Error generating expiry PDF:', error);
            throw new Error('Failed to generate expiry PDF');
        }
    }
    
    static createExpiryReportHTML(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #C0392B; 
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #C0392B; 
                    margin: 0; 
                    font-size: 28px;
                }
                .summary { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 30px;
                }
                .summary-card { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 8px; 
                    border-left: 4px solid #C0392B;
                }
                .summary-card h3 { 
                    margin: 0 0 10px 0; 
                    color: #C0392B; 
                    font-size: 16px;
                }
                .summary-card .value { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #333;
                }
                .alert { 
                    background: #f8d7da; 
                    border: 1px solid #f5c6cb; 
                    color: #721c24; 
                    padding: 15px; 
                    border-radius: 8px; 
                    margin-bottom: 20px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left; 
                    font-size: 12px;
                }
                th { 
                    background-color: #C0392B; 
                    color: white; 
                    font-weight: bold;
                }
                tr:nth-child(even) { 
                    background-color: #f9f9f9;
                }
                .status-badge { 
                    padding: 4px 8px; 
                    border-radius: 12px; 
                    font-size: 10px; 
                    font-weight: bold;
                }
                .status-expired { 
                    background: #f8d7da; 
                    color: #721c24;
                }
                .status-expiring { 
                    background: #fff3cd; 
                    color: #856404;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${data.title}</h1>
                <p>Generated on: ${new Date(data.generatedAt).toLocaleDateString()}</p>
            </div>
            
            ${data.summary.alreadyExpired > 0 ? `
                <div class="alert">
                    <strong>⚠️ Attention:</strong> ${data.summary.alreadyExpired} medicines have already expired and should be removed immediately.
                </div>
            ` : ''}
            
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Expiring</h3>
                    <div class="value">${data.summary.totalExpiringSoon}</div>
                    <div class="label">Medicines</div>
                </div>
                <div class="summary-card">
                    <h3>Already Expired</h3>
                    <div class="value">${data.summary.alreadyExpired}</div>
                    <div class="label">Critical</div>
                </div>
                <div class="summary-card">
                    <h3>Value at Risk</h3>
                    <div class="value">$${data.summary.totalValueAtRisk.toFixed(2)}</div>
                    <div class="label">Potential Loss</div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Medicine Name</th>
                        <th>Pharmacy</th>
                        <th>Stock</th>
                        <th>Value</th>
                        <th>Expiry Date</th>
                        <th>Days Until Expiry</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.medicines.map(med => `
                        <tr>
                            <td>${med.name}</td>
                            <td>${med.pharmacy}</td>
                            <td>${med.stock}</td>
                            <td>$${med.value.toFixed(2)}</td>
                            <td>${new Date(med.expiryDate).toLocaleDateString()}</td>
                            <td>${med.daysUntilExpiry}</td>
                            <td>
                                <span class="status-badge ${med.status === 'Expired' ? 'status-expired' : 'status-expiring'}">
                                    ${med.status}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>`;
    }

    static async generateOrdersPDF(reportData) {
        try {
            // First try with html-pdf (simpler, no Chrome required)
            return await this.generateOrdersPDFWithHtmlPdf(reportData);
        } catch (error) {
            console.log('html-pdf failed for orders, trying Puppeteer:', error.message);
            try {
                // Fallback to Puppeteer if html-pdf fails
                return await this.generateOrdersPDFWithPuppeteer(reportData);
            } catch (puppeteerError) {
                console.error('Both PDF methods failed for orders:', puppeteerError);
                throw new Error(`Failed to generate orders PDF: ${puppeteerError.message}`);
            }
        }
    }

    static async generateOrdersPDFWithHtmlPdf(reportData) {
        return new Promise((resolve, reject) => {
            const html = this.createOrdersReportHTML(reportData);
            
            const options = {
                format: 'A4',
                orientation: 'portrait',
                border: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                header: {
                    height: '20mm',
                    contents: '<div style="font-size: 10px; color: #666; text-align: center; width: 100%;">MediReach Orders Report</div>'
                },
                footer: {
                    height: '20mm',
                    contents: '<div style="font-size: 10px; color: #666; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
                }
            };

            htmlPdf.create(html, options).toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            });
        });
    }

    static async generateOrdersPDFWithPuppeteer(reportData) {
        let browser;
        try {
            const launchOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            };

            browser = await puppeteer.launch(launchOptions);
            const page = await browser.newPage();
            
            const html = this.createOrdersReportHTML(reportData);
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                displayHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                        MediReach Orders Report
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                    </div>
                `
            });
            
            await browser.close();
            return pdfBuffer;
            
        } catch (error) {
            if (browser) await browser.close();
            throw error;
        }
    }

    static createOrdersReportHTML(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px;
                    border-bottom: 2px solid #023E8A;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #023E8A; 
                    margin: 0;
                    font-size: 28px;
                }
                .summary { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 30px; 
                    flex-wrap: wrap;
                }
                .summary-card { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 8px; 
                    text-align: center; 
                    border-left: 4px solid #023E8A;
                    flex: 1;
                    margin: 0 5px;
                    min-width: 120px;
                }
                .summary-card h3 { 
                    margin: 0 0 5px 0; 
                    color: #666; 
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .summary-card .value { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #023E8A;
                    margin: 0;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left; 
                    font-size: 12px;
                }
                th { 
                    background-color: #023E8A; 
                    color: white; 
                    font-weight: bold;
                }
                tr:nth-child(even) { 
                    background-color: #f9f9f9;
                }
                .status-badge { 
                    padding: 4px 8px; 
                    border-radius: 12px; 
                    font-size: 10px; 
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .status-delivered { 
                    background: #d4edda; 
                    color: #155724;
                }
                .status-pending { 
                    background: #fff3cd; 
                    color: #856404;
                }
                .status-processing { 
                    background: #cce5ff; 
                    color: #004085;
                }
                .status-in_transit { 
                    background: #e2e3e5; 
                    color: #383d41;
                }
                .status-cancelled { 
                    background: #f8d7da; 
                    color: #721c24;
                }
                .priority-badge {
                    padding: 2px 6px;
                    border-radius: 8px;
                    font-size: 9px;
                    font-weight: bold;
                }
                .priority-urgent {
                    background: #f8d7da;
                    color: #721c24;
                }
                .priority-normal {
                    background: #e2e3e5;
                    color: #383d41;
                }
                .section-title {
                    font-size: 18px;
                    color: #023E8A;
                    margin: 30px 0 15px 0;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${data.title}</h1>
                <p>Generated on: ${new Date(data.generatedAt).toLocaleDateString()}</p>
                ${data.filters.pharmacy ? `<p>Pharmacy: ${data.filters.pharmacy}</p>` : ''}
                ${data.filters.status ? `<p>Status: ${data.filters.status}</p>` : ''}
                ${data.filters.priority ? `<p>Priority: ${data.filters.priority}</p>` : ''}
            </div>
            
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Orders</h3>
                    <div class="value">${data.summary.totalOrders}</div>
                </div>
                <div class="summary-card">
                    <h3>Total Value</h3>
                    <div class="value">$${data.summary.totalValue.toLocaleString()}</div>
                </div>
                <div class="summary-card">
                    <h3>Pending</h3>
                    <div class="value">${data.summary.pendingOrders}</div>
                </div>
                <div class="summary-card">
                    <h3>Delivered</h3>
                    <div class="value">${data.summary.deliveredOrders}</div>
                </div>
                <div class="summary-card">
                    <h3>Urgent</h3>
                    <div class="value">${data.summary.urgentOrders}</div>
                </div>
            </div>

            <h2 class="section-title">Orders Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Pharmacy</th>
                        <th>Medicine</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Ordered Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.orders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.pharmacy}</td>
                            <td>${order.medicine}</td>
                            <td>${order.category}</td>
                            <td>${order.quantity}</td>
                            <td>$${order.unitPrice}</td>
                            <td>$${order.totalPrice.toLocaleString()}</td>
                            <td>
                                <span class="status-badge status-${order.status}">
                                    ${order.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>
                                <span class="priority-badge priority-${order.priority}">
                                    ${order.priority}
                                </span>
                            </td>
                            <td>${new Date(order.orderedAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h2 class="section-title">Status Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Count</th>
                        <th>Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(data.statusBreakdown).map(([status, info]) => `
                        <tr>
                            <td>
                                <span class="status-badge status-${status}">
                                    ${status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>${info.count}</td>
                            <td>$${info.totalValue.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h2 class="section-title">Pharmacy Breakdown</h2>
            <table>
                <thead>
                    <tr>
                        <th>Pharmacy</th>
                        <th>Orders</th>
                        <th>Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(data.pharmacyBreakdown).map(([pharmacy, info]) => `
                        <tr>
                            <td>${pharmacy}</td>
                            <td>${info.count}</td>
                            <td>$${info.totalValue.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>`;
    }
}

module.exports = PDFService;
