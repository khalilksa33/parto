const Tenant = require('../models/Tenant');
const Product = require('../models/Product');

// Register a new Vendor/Tenant
exports.registerTenant = async (req, res) => {
  try {
    const { name, subdomain, businessType } = req.body;

    // Validate required fields
    if (!name || !subdomain || !businessType) {
      return res.status(400).json({ success: false, message: 'Please provide name, subdomain, and businessType' });
    }

    // Check if subdomain already exists
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingTenant) {
      return res.status(400).json({ success: false, message: 'Subdomain already in use' });
    }

    // Create Tenant
    const tenant = await Tenant.create({
      name,
      subdomain,
      businessType
    });

    // Auto-create a default product for the new tenant based on business type
    let defaultProduct = {
      tenantId: tenant._id,
      name: 'Default Product',
      price: 0,
      category: 'Uncategorized',
      emoji: '📦',
      featured: true
    };

    if (businessType === 'used_auto_spare_parts') {
      defaultProduct = {
        tenantId: tenant._id,
        name: 'Used V6 Engine Hood',
        price: 350,
        category: 'Used Parts',
        emoji: '🚗',
        featured: true
      };
    }

    const product = await Product.create(defaultProduct);

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully',
      data: {
        tenant,
        defaultProduct: product
      }
    });

  } catch (error) {
    console.error('Tenant Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server Error during registration' });
  }
};
