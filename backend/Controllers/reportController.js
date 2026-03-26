const Medicine = require('../Model/medicineModel');
const PDFService = require('../Services/pdfService');

// ─── Report Generation Functions ────────────────────────────────────────────────

// Generate inventory report
const generateInventoryReport = async (req, res) => {
    try {
        const { format = 'json', pharmacy, category } = req.query;
        
        // Build query filters
        const filter = {};
        if (pharmacy) filter.Pharmacy = pharmacy;
        if (category) filter.mediCategory = category;
        
        // Fetch medicines with filters
        const medicines = await Medicine.find(filter);
        
        // Generate report data
        const reportData = {
            title: 'Medicine Inventory Report',
            generatedAt: new Date().toISOString(),
            filters: { pharmacy, category },
            summary: {
                totalMedicines: medicines.length,
                totalValue: medicines.reduce((sum, med) => sum + (med.mediPrice * med.mediStock), 0),
                lowStockItems: medicines.filter(med => med.mediStock <= 10).length,
                expiredItems: medicines.filter(med => new Date(med.mediExpiryDate) <= new Date()).length,
                expiringSoonItems: medicines.filter(med => {
                    const daysUntilExpiry = Math.ceil((new Date(med.mediExpiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                }).length
            },
            pharmacyBreakdown: medicines.reduce((acc, med) => {
                const pharmacy = med.Pharmacy || 'Unknown';
                if (!acc[pharmacy]) {
                    acc[pharmacy] = {
                        count: 0,
                        totalValue: 0,
                        lowStock: 0,
                        expired: 0
                    };
                }
                acc[pharmacy].count++;
                acc[pharmacy].totalValue += med.mediPrice * med.mediStock;
                if (med.mediStock <= 10) acc[pharmacy].lowStock++;
                if (new Date(med.mediExpiryDate) <= new Date()) acc[pharmacy].expired++;
                return acc;
            }, {}),
            categoryBreakdown: medicines.reduce((acc, med) => {
                const category = med.mediCategory || 'Unknown';
                if (!acc[category]) {
                    acc[category] = {
                        count: 0,
                        totalValue: 0,
                        avgPrice: 0
                    };
                }
                acc[category].count++;
                acc[category].totalValue += med.mediPrice * med.mediStock;
                acc[category].avgPrice = acc[category].totalValue / acc[category].count;
                return acc;
            }, {}),
            medicines: medicines.map(med => ({
                id: med._id,
                name: med.mediName,
                category: med.mediCategory,
                company: med.mediCompany,
                pharmacy: med.Pharmacy,
                price: med.mediPrice,
                stock: med.mediStock,
                value: med.mediPrice * med.mediStock,
                manufactureDate: med.mediManufactureDate,
                expiryDate: med.mediExpiryDate,
                prescriptionStatus: med.mediPrescriptionStatus,
                stockStatus: med.mediStock === 0 ? 'Out of Stock' : 
                           med.mediStock <= 10 ? 'Low Stock' : 'In Stock',
                daysUntilExpiry: Math.ceil((new Date(med.mediExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))
            }))
        };

        if (format === 'json') {
            return res.status(200).json(reportData);
        }
        
        if (format === 'pdf') {
            try {
                const pdfBuffer = await PDFService.generateInventoryPDF(reportData);
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="inventory-report-${new Date().toISOString().split('T')[0]}.pdf"`);
                res.setHeader('Content-Length', pdfBuffer.length);
                
                return res.send(pdfBuffer);
            } catch (pdfError) {
                console.error('PDF generation error:', pdfError);
                return res.status(500).json({ message: 'Failed to generate PDF report' });
            }
        }
        
        res.status(400).json({ message: 'Invalid format. Use json or pdf' });
        
    } catch (error) {
        console.error('Error generating inventory report:', error);
        res.status(500).json({ message: 'Failed to generate inventory report' });
    }
};

// Generate expiry report
const generateExpiryReport = async (req, res) => {
    try {
        const { format = 'json', days = 90 } = req.query;
        
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + parseInt(days));
        
        const medicines = await Medicine.find({
            mediExpiryDate: { $lte: futureDate }
        });
        
        const reportData = {
            title: `Medicine Expiry Report (Next ${days} days)`,
            generatedAt: new Date().toISOString(),
            summary: {
                totalExpiringSoon: medicines.length,
                alreadyExpired: medicines.filter(med => new Date(med.mediExpiryDate) <= today).length,
                totalValueAtRisk: medicines.reduce((sum, med) => sum + (med.mediPrice * med.mediStock), 0)
            },
            medicines: medicines.map(med => ({
                id: med._id,
                name: med.mediName,
                pharmacy: med.Pharmacy,
                stock: med.mediStock,
                value: med.mediPrice * med.mediStock,
                expiryDate: med.mediExpiryDate,
                daysUntilExpiry: Math.ceil((new Date(med.mediExpiryDate) - today) / (1000 * 60 * 60 * 24)),
                status: new Date(med.mediExpiryDate) <= today ? 'Expired' : 'Expiring Soon'
            })).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
        };

        if (format === 'json') {
            return res.status(200).json(reportData);
        }
        
        if (format === 'pdf') {
            try {
                const pdfBuffer = await PDFService.generateExpiryPDF(reportData);
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="expiry-report-${new Date().toISOString().split('T')[0]}.pdf"`);
                res.setHeader('Content-Length', pdfBuffer.length);
                
                return res.send(pdfBuffer);
            } catch (pdfError) {
                console.error('PDF generation error:', pdfError);
                return res.status(500).json({ message: 'Failed to generate PDF report' });
            }
        }
        
        res.status(400).json({ message: 'Invalid format. Use json or pdf' });
        
    } catch (error) {
        console.error('Error generating expiry report:', error);
        res.status(500).json({ message: 'Failed to generate expiry report' });
    }
};

// Generate low stock report
const generateLowStockReport = async (req, res) => {
    try {
        const { format = 'json', threshold = 10 } = req.query;
        
        const medicines = await Medicine.find({
            mediStock: { $lte: parseInt(threshold) }
        });
        
        const reportData = {
            title: `Low Stock Report (≤ ${threshold} items)`,
            generatedAt: new Date().toISOString(),
            summary: {
                totalLowStock: medicines.length,
                outOfStock: medicines.filter(med => med.mediStock === 0).length,
                totalValueToReorder: medicines.reduce((sum, med) => sum + (med.mediPrice * med.mediStock), 0)
            },
            medicines: medicines.map(med => ({
                id: med._id,
                name: med.mediName,
                pharmacy: med.Pharmacy,
                category: med.mediCategory,
                currentStock: med.mediStock,
                price: med.mediPrice,
                value: med.mediPrice * med.mediStock,
                status: med.mediStock === 0 ? 'Out of Stock' : 'Low Stock'
            })).sort((a, b) => a.currentStock - b.currentStock)
        };

        if (format === 'json') {
            return res.status(200).json(reportData);
        }
        
        res.status(400).json({ message: 'PDF format not implemented for low stock report yet' });
        
    } catch (error) {
        console.error('Error generating low stock report:', error);
        res.status(500).json({ message: 'Failed to generate low stock report' });
    }
};

// Generate pharmacy performance report
const generatePharmacyReport = async (req, res) => {
    try {
        const { format = 'json', pharmacyId } = req.query;
        
        let filter = {};
        if (pharmacyId) filter.Pharmacy = pharmacyId;
        
        const medicines = await Medicine.find(filter);
        
        const pharmacyStats = medicines.reduce((acc, med) => {
            const pharmacy = med.Pharmacy || 'Unknown';
            if (!acc[pharmacy]) {
                acc[pharmacy] = {
                    name: pharmacy,
                    totalMedicines: 0,
                    totalValue: 0,
                    lowStockCount: 0,
                    expiredCount: 0,
                    categories: {},
                    avgPrice: 0
                };
            }
            
            acc[pharmacy].totalMedicines++;
            acc[pharmacy].totalValue += med.mediPrice * med.mediStock;
            
            if (med.mediStock <= 10) acc[pharmacy].lowStockCount++;
            if (new Date(med.mediExpiryDate) <= new Date()) acc[pharmacy].expiredCount++;
            
            const category = med.mediCategory || 'Unknown';
            if (!acc[pharmacy].categories[category]) {
                acc[pharmacy].categories[category] = 0;
            }
            acc[pharmacy].categories[category]++;
            
            return acc;
        }, {});
        
        // Calculate averages and sort categories
        Object.keys(pharmacyStats).forEach(pharmacy => {
            const stats = pharmacyStats[pharmacy];
            stats.avgPrice = stats.totalValue / stats.totalMedicines;
            stats.topCategories = Object.entries(stats.categories)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, count]) => ({ category, count }));
        });

        const reportData = {
            title: 'Pharmacy Performance Report',
            generatedAt: new Date().toISOString(),
            summary: {
                totalPharmacies: Object.keys(pharmacyStats).length,
                totalMedicines: medicines.length,
                totalSystemValue: medicines.reduce((sum, med) => sum + (med.mediPrice * med.mediStock), 0),
                overallLowStockRate: (medicines.filter(med => med.mediStock <= 10).length / medicines.length * 100).toFixed(2) + '%',
                overallExpiredRate: (medicines.filter(med => new Date(med.mediExpiryDate) <= new Date()).length / medicines.length * 100).toFixed(2) + '%'
            },
            pharmacies: Object.values(pharmacyStats).sort((a, b) => b.totalValue - a.totalValue)
        };

        if (format === 'json') {
            return res.status(200).json(reportData);
        }
        
        res.status(400).json({ message: 'PDF format not implemented for pharmacy report yet' });
        
    } catch (error) {
        console.error('Error generating pharmacy report:', error);
        res.status(500).json({ message: 'Failed to generate pharmacy report' });
    }
};

// Generate orders report
const generateOrdersReport = async (req, res) => {
    try {
        const { format = 'json', pharmacy, status, priority, startDate, endDate } = req.query;
        
        // Since we don't have an Order model in the backend yet, 
        // we'll use the sample data from the frontend for now
        // In a real implementation, you would fetch from your Order model
        const sampleOrders = [
            { id:"ORD-2841", pharmacy:"Kandy Central Pharmacy", location:"Kandy, Central Province", medicine:"Amoxicillin 500mg", category:"Antibiotic", qty:200, unitPrice:145, status:"delivered", priority:"normal", orderedAt:"2025-03-01", deliveredAt:"2025-03-03", notes:"" },
            { id:"ORD-2842", pharmacy:"Galle Fort MedPoint", location:"Galle, Southern Province", medicine:"Paracetamol 500mg", category:"Analgesic", qty:500, unitPrice:35, status:"in_transit", priority:"normal", orderedAt:"2025-03-05", deliveredAt:null, notes:"" },
            { id:"ORD-2843", pharmacy:"Jaffna Community Rx", location:"Jaffna, Northern Province", medicine:"Salbutamol Inhaler", category:"Respiratory", qty:50, unitPrice:680, status:"pending", priority:"urgent", orderedAt:"2025-03-06", deliveredAt:null, notes:"Low supply — urgent" },
            { id:"ORD-2844", pharmacy:"Matara Rural Clinic", location:"Matara, Southern Province", medicine:"Metformin 850mg", category:"Antidiabetic", qty:300, unitPrice:95, status:"delivered", priority:"normal", orderedAt:"2025-02-28", deliveredAt:"2025-03-02", notes:"" },
            { id:"ORD-2845", pharmacy:"Anuradhapura PharmaCare", location:"Anuradhapura, North Central", medicine:"ORS Sachets", category:"Rehydration", qty:800, unitPrice:25, status:"cancelled", priority:"normal", orderedAt:"2025-03-04", deliveredAt:null, notes:"Order cancelled by pharmacy" },
            { id:"ORD-2846", pharmacy:"Batticaloa MedStore", location:"Batticaloa, Eastern Province", medicine:"Cetirizine 10mg", category:"Antihistamine", qty:150, unitPrice:55, status:"processing", priority:"normal", orderedAt:"2025-03-07", deliveredAt:null, notes:"" },
            { id:"ORD-2847", pharmacy:"Kurunegala Health Hub", location:"Kurunegala, North Western", medicine:"Amlodipine 5mg", category:"Cardiovascular", qty:120, unitPrice:210, status:"pending", priority:"urgent", orderedAt:"2025-03-07", deliveredAt:null, notes:"Critical — stock depleted" },
            { id:"ORD-2848", pharmacy:"Trincomalee Bay Pharmacy", location:"Trincomalee, Eastern Province", medicine:"Azithromycin 500mg", category:"Antibiotic", qty:80, unitPrice:280, status:"in_transit", priority:"normal", orderedAt:"2025-03-06", deliveredAt:null, notes:"" },
            { id:"ORD-2849", pharmacy:"Kandy Central Pharmacy", location:"Kandy, Central Province", medicine:"Vitamin D3 1000 IU", category:"Supplement", qty:400, unitPrice:120, status:"delivered", priority:"normal", orderedAt:"2025-02-25", deliveredAt:"2025-02-27", notes:"" },
            { id:"ORD-2850", pharmacy:"Galle Fort MedPoint", location:"Galle, Southern Province", medicine:"Ibuprofen 400mg", category:"Analgesic", qty:600, unitPrice:65, status:"processing", priority:"normal", orderedAt:"2025-03-07", deliveredAt:null, notes:"" },
            { id:"ORD-2851", pharmacy:"Matara Rural Clinic", location:"Matara, Southern Province", medicine:"Fluconazole 150mg", category:"Antifungal", qty:60, unitPrice:320, status:"delivered", priority:"normal", orderedAt:"2025-02-20", deliveredAt:"2025-02-22", notes:"" },
            { id:"ORD-2852", pharmacy:"Batticaloa MedStore", location:"Batticaloa, Eastern Province", medicine:"Omeprazole 20mg", category:"Other", qty:250, unitPrice:88, status:"in_transit", priority:"urgent", orderedAt:"2025-03-05", deliveredAt:null, notes:"Expedited shipping" },
            { id:"ORD-2853", pharmacy:"Jaffna Community Rx", location:"Jaffna, Northern Province", medicine:"Oseltamivir 75mg", category:"Antiviral", qty:30, unitPrice:1250, status:"pending", priority:"urgent", orderedAt:"2025-03-07", deliveredAt:null, notes:"Flu outbreak — critical" },
            { id:"ORD-2854", pharmacy:"Trincomalee Bay Pharmacy", location:"Trincomalee, Eastern Province", medicine:"Atorvastatin 20mg", category:"Cardiovascular", qty:180, unitPrice:175, status:"delivered", priority:"normal", orderedAt:"2025-02-22", deliveredAt:"2025-02-25", notes:"" },
            { id:"ORD-2855", pharmacy:"Kurunegala Health Hub", location:"Kurunegala, North Western", medicine:"Morphine Sulfate 10mg", category:"Analgesic", qty:20, unitPrice:890, status:"processing", priority:"urgent", orderedAt:"2025-03-06", deliveredAt:null, notes:"Controlled — requires auth" },
        ];
        
        // Apply filters
        let filteredOrders = sampleOrders;
        
        if (pharmacy && pharmacy !== 'All') {
            filteredOrders = filteredOrders.filter(order => order.pharmacy === pharmacy);
        }
        
        if (status && status !== 'All') {
            filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        
        if (priority && priority !== 'All') {
            filteredOrders = filteredOrders.filter(order => order.priority === priority);
        }
        
        if (startDate) {
            const start = new Date(startDate);
            filteredOrders = filteredOrders.filter(order => new Date(order.orderedAt) >= start);
        }
        
        if (endDate) {
            const end = new Date(endDate);
            filteredOrders = filteredOrders.filter(order => new Date(order.orderedAt) <= end);
        }
        
        // Generate report data
        const reportData = {
            title: 'Pharmacy Orders Report',
            generatedAt: new Date().toISOString(),
            filters: { pharmacy, status, priority, startDate, endDate },
            summary: {
                totalOrders: filteredOrders.length,
                totalValue: filteredOrders.reduce((sum, order) => sum + (order.unitPrice * order.qty), 0),
                pendingOrders: filteredOrders.filter(order => order.status === 'pending').length,
                deliveredOrders: filteredOrders.filter(order => order.status === 'delivered').length,
                urgentOrders: filteredOrders.filter(order => order.priority === 'urgent').length,
                averageOrderValue: filteredOrders.length > 0 ? 
                    filteredOrders.reduce((sum, order) => sum + (order.unitPrice * order.qty), 0) / filteredOrders.length : 0
            },
            statusBreakdown: filteredOrders.reduce((acc, order) => {
                if (!acc[order.status]) {
                    acc[order.status] = { count: 0, totalValue: 0 };
                }
                acc[order.status].count++;
                acc[order.status].totalValue += order.unitPrice * order.qty;
                return acc;
            }, {}),
            pharmacyBreakdown: filteredOrders.reduce((acc, order) => {
                if (!acc[order.pharmacy]) {
                    acc[order.pharmacy] = { count: 0, totalValue: 0 };
                }
                acc[order.pharmacy].count++;
                acc[order.pharmacy].totalValue += order.unitPrice * order.qty;
                return acc;
            }, {}),
            categoryBreakdown: filteredOrders.reduce((acc, order) => {
                if (!acc[order.category]) {
                    acc[order.category] = { count: 0, totalValue: 0 };
                }
                acc[order.category].count++;
                acc[order.category].totalValue += order.unitPrice * order.qty;
                return acc;
            }, {}),
            orders: filteredOrders.map(order => ({
                id: order.id,
                pharmacy: order.pharmacy,
                location: order.location,
                medicine: order.medicine,
                category: order.category,
                quantity: order.qty,
                unitPrice: order.unitPrice,
                totalPrice: order.unitPrice * order.qty,
                status: order.status,
                priority: order.priority,
                orderedAt: order.orderedAt,
                deliveredAt: order.deliveredAt,
                notes: order.notes
            }))
        };

        if (format === 'json') {
            return res.status(200).json(reportData);
        }
        
        if (format === 'pdf') {
            try {
                const pdfBuffer = await PDFService.generateOrdersPDF(reportData);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="orders-report-${new Date().toISOString().split('T')[0]}.pdf"`);
                return res.send(pdfBuffer);
            } catch (pdfError) {
                console.error('PDF generation error:', pdfError);
                return res.status(500).json({ message: 'Failed to generate PDF', error: pdfError.message });
            }
        }
        
        res.status(400).json({ message: 'Invalid format specified' });
        
    } catch (error) {
        console.error('Error generating orders report:', error);
        res.status(500).json({ message: 'Failed to generate orders report' });
    }
};

module.exports = {
    generateInventoryReport,
    generateExpiryReport,
    generateLowStockReport,
    generatePharmacyReport,
    generateOrdersReport
};
