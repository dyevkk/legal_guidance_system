const express = require('express');
const router = express.Router();

// Comprehensive mock data of legal services across major Indian cities
const legalServicesData = {
    delhi: {
        policeStations: [
            { name: 'Connaught Place Police Station', address: 'Connaught Place, New Delhi - 110001', phone: '011-23411444', hours: '24/7', lat: 28.6315, lng: 77.2167 },
            { name: 'Lajpat Nagar Police Station', address: 'Lajpat Nagar, New Delhi - 110024', phone: '011-29811400', hours: '24/7', lat: 28.5655, lng: 77.2432 },
            { name: 'Saket Police Station', address: 'Saket, New Delhi - 110017', phone: '011-26564949', hours: '24/7', lat: 28.5244, lng: 77.2066 }
        ],
        courts: [
            { name: 'Delhi High Court', address: 'Sher Shah Road, New Delhi - 110003', phone: '011-23384475', hours: 'Mon-Sat 10AM-5PM', lat: 28.6235, lng: 77.2418 },
            { name: 'Patiala House Courts', address: 'Mathura Road, New Delhi - 110001', phone: '011-23385190', hours: 'Mon-Sat 10AM-5PM', lat: 28.6175, lng: 77.2415 },
            { name: 'Saket District Court', address: 'Press Enclave Marg, Saket - 110017', phone: '011-26519666', hours: 'Mon-Sat 10AM-5PM', lat: 28.5270, lng: 77.2167 }
        ],
        lawyers: [
            { name: 'Adv. Rajesh Kumar Sharma', specialization: 'Criminal Law, IPC', address: 'Chamber 204, Delhi High Court', phone: '+91-9810001234', hours: 'Mon-Sat 10AM-6PM', lat: 28.6235, lng: 77.2418 },
            { name: 'Adv. Priya Mehta & Associates', specialization: 'Family Law, Divorce, Custody', address: 'Lawyers Chambers, Patiala House', phone: '+91-9810005678', hours: 'Mon-Fri 9AM-7PM', lat: 28.6175, lng: 77.2415 },
            { name: 'Adv. Suresh Nair', specialization: 'Consumer Protection, Labour Law', address: '45 Barakhamba Road, New Delhi', phone: '+91-9810009012', hours: 'Mon-Sat 11AM-6PM', lat: 28.6271, lng: 77.2252 }
        ],
        legalAid: [
            { name: 'Delhi State Legal Services Authority', address: 'Patiala House Courts Complex, New Delhi', phone: '011-23385606', hours: 'Mon-Sat 10AM-5PM', lat: 28.6175, lng: 77.2415 },
            { name: 'Delhi High Court Legal Services Committee', address: 'Delhi High Court, Sher Shah Road', phone: '011-23384475', hours: 'Mon-Fri 10AM-4PM', lat: 28.6235, lng: 77.2418 }
        ],
        notary: [
            { name: 'Rajendra Singh, Notary Public', address: '12 Connaught Place, New Delhi', phone: '+91-9810012345', hours: 'Mon-Sat 10AM-6PM', lat: 28.6315, lng: 77.2167 }
        ]
    },
    mumbai: {
        policeStations: [
            { name: 'Colaba Police Station', address: 'Colaba Causeway, Mumbai - 400005', phone: '022-22020011', hours: '24/7', lat: 18.9067, lng: 72.8147 },
            { name: 'Andheri Police Station', address: 'J.P. Road, Andheri West, Mumbai - 400058', phone: '022-26281111', hours: '24/7', lat: 19.1136, lng: 72.8697 },
            { name: 'Bandra Police Station', address: 'Bandra West, Mumbai - 400050', phone: '022-26404848', hours: '24/7', lat: 19.0544, lng: 72.8402 }
        ],
        courts: [
            { name: 'Bombay High Court', address: 'Fort, Mumbai - 400032', phone: '022-22620431', hours: 'Mon-Sat 10AM-5PM', lat: 18.9318, lng: 72.8347 },
            { name: 'City Civil & Sessions Court', address: 'Mumbai - 400001', phone: '022-22621008', hours: 'Mon-Sat 10AM-5PM', lat: 18.9388, lng: 72.8354 }
        ],
        lawyers: [
            { name: 'Adv. Aisha Khan', specialization: 'Property Law, Civil Disputes', address: 'Bombay High Court Chambers', phone: '+91-9820001234', hours: 'Mon-Sat 10AM-6PM', lat: 18.9318, lng: 72.8347 },
            { name: 'Adv. Punit Desai & Co.', specialization: 'Corporate, Contract, Employment', address: '23 Nariman Point, Mumbai', phone: '+91-9820005678', hours: 'Mon-Fri 9AM-7PM', lat: 18.9257, lng: 72.8242 }
        ],
        legalAid: [
            { name: 'Maharashtra State Legal Services Authority', address: 'Bombay High Court Annex, Mumbai', phone: '022-22620175', hours: 'Mon-Sat 10AM-5PM', lat: 18.9318, lng: 72.8347 }
        ],
        notary: [
            { name: 'M.R. Patil, Notary Public', address: '5 Fort Area, Mumbai', phone: '+91-9820011111', hours: 'Mon-Sat 9AM-6PM', lat: 18.9388, lng: 72.8354 }
        ]
    },
    bangalore: {
        policeStations: [
            { name: 'Cubbon Park Police Station', address: 'Cubbon Park, Bengaluru - 560001', phone: '080-22942222', hours: '24/7', lat: 12.9763, lng: 77.5929 },
            { name: 'Koramangala Police Station', address: 'Koramangala, Bengaluru - 560034', phone: '080-25521515', hours: '24/7', lat: 12.9279, lng: 77.6271 }
        ],
        courts: [
            { name: 'Karnataka High Court', address: 'High Court Rd, Bengaluru - 560001', phone: '080-22543400', hours: 'Mon-Sat 10AM-5PM', lat: 12.9716, lng: 77.5946 },
            { name: 'City Civil Court Bengaluru', address: 'A.V. Road, Bengaluru - 560002', phone: '080-22864065', hours: 'Mon-Sat 10AM-5PM', lat: 12.9792, lng: 77.5937 }
        ],
        lawyers: [
            { name: 'Adv. Vikram Rao', specialization: 'Cybercrime, IT Law', address: 'Karnataka High Court', phone: '+91-9900001234', hours: 'Mon-Fri 10AM-7PM', lat: 12.9716, lng: 77.5946 },
            { name: 'Adv. Shalini Menon', specialization: 'Labour Law, Employment', address: '12 MG Road, Bengaluru', phone: '+91-9900005678', hours: 'Mon-Sat 10AM-6PM', lat: 12.9757, lng: 77.6011 }
        ],
        legalAid: [
            { name: 'Karnataka State Legal Services Authority', address: 'High Court Building, Bengaluru', phone: '080-22543490', hours: 'Mon-Sat 10AM-5PM', lat: 12.9716, lng: 77.5946 }
        ],
        notary: [
            { name: 'B.S. Naidu, Notary Public', address: 'Brigade Road, Bengaluru', phone: '+91-9900012345', hours: 'Mon-Sat 9AM-6PM', lat: 12.9722, lng: 77.6063 }
        ]
    },
    chennai: {
        policeStations: [
            { name: 'Egmore Police Station', address: 'Egmore, Chennai - 600008', phone: '044-28192801', hours: '24/7', lat: 13.0782, lng: 80.2625 },
            { name: 'Anna Nagar Police Station', address: 'Anna Nagar, Chennai - 600040', phone: '044-26211100', hours: '24/7', lat: 13.0850, lng: 80.2102 }
        ],
        courts: [
            { name: 'Madras High Court', address: 'High Court Rd, Chennai - 600104', phone: '044-25301329', hours: 'Mon-Sat 10AM-5PM', lat: 13.0826, lng: 80.2817 }
        ],
        lawyers: [
            { name: 'Adv. S. Raghunathan', specialization: 'Criminal Law, Consumer', address: 'Madras High Court Chambers', phone: '+91-9840001234', hours: 'Mon-Sat 10AM-6PM', lat: 13.0826, lng: 80.2817 }
        ],
        legalAid: [
            { name: 'Tamil Nadu State Legal Services Authority', address: 'Madras High Court, Chennai', phone: '044-25301333', hours: 'Mon-Sat 10AM-5PM', lat: 13.0826, lng: 80.2817 }
        ],
        notary: [
            { name: 'T. Krishnamurthy, Notary Public', address: 'Egmore, Chennai', phone: '+91-9840054321', hours: 'Mon-Sat 9AM-6PM', lat: 13.0782, lng: 80.2625 }
        ]
    },
    hyderabad: {
        policeStations: [
            { name: 'Banjara Hills Police Station', address: 'Road No. 12, Banjara Hills, Hyd - 500034', phone: '040-27777777', hours: '24/7', lat: 17.4139, lng: 78.4342 },
            { name: 'Cyberabad Police Station', address: 'Madhapur, Hyderabad - 500081', phone: '040-23480700', hours: '24/7', lat: 17.4500, lng: 78.3910 }
        ],
        courts: [
            { name: 'Telangana High Court', address: 'Nayapul, Hyderabad - 500001', phone: '040-23253063', hours: 'Mon-Sat 10AM-5PM', lat: 17.3850, lng: 78.4867 }
        ],
        lawyers: [
            { name: 'Adv. Ravinder Reddy', specialization: 'Property Disputes, Civil', address: 'Telangana High Court', phone: '+91-9810011223', hours: 'Mon-Fri 10AM-6PM', lat: 17.3850, lng: 78.4867 }
        ],
        legalAid: [
            { name: 'Telangana State Legal Services Authority', address: 'High Court Buildings, Hyderabad', phone: '040-23253070', hours: 'Mon-Sat 10AM-5PM', lat: 17.3850, lng: 78.4867 }
        ],
        notary: [
            { name: 'A. Krishnaswamy, Notary Public', address: 'Abids, Hyderabad', phone: '+91-9810099887', hours: 'Mon-Sat 9AM-6PM', lat: 17.3933, lng: 78.4710 }
        ]
    },
    malappuram: {
        policeStations: [
            { name: 'Malappuram Police Station', address: 'Up Hill, Malappuram - 676505', phone: '0483-2734966', hours: '24/7', lat: 11.0407, lng: 76.0827 },
            { name: 'Manjeri Police Station', address: 'Manjeri, Malappuram - 676121', phone: '0483-2766866', hours: '24/7', lat: 11.1219, lng: 76.1265 }
        ],
        courts: [
            { name: 'District & Sessions Court', address: 'Kavungal Byepass Rd, Malappuram - 676505', phone: '0483-2735166', hours: 'Mon-Sat 10AM-5PM', lat: 11.0441, lng: 76.0820 }
        ],
        lawyers: [
            { name: 'Adv. M. K. Narayanan', specialization: 'Criminal & Civil', address: 'Near District Court, Malappuram', phone: '+91-9447012345', hours: 'Mon-Sat 9AM-6PM', lat: 11.0450, lng: 76.0830 }
        ],
        legalAid: [
            { name: 'District Legal Services Authority', address: 'District Court Complex, Malappuram', phone: '0483-2732155', hours: 'Mon-Sat 10AM-5PM', lat: 11.0441, lng: 76.0820 }
        ],
        notary: [
            { name: 'Abdul Rahman, Notary Public', address: 'Kadavanthra, Malappuram', phone: '+91-9447055555', hours: 'Mon-Sat 9AM-6PM', lat: 11.0390, lng: 76.0790 }
        ]
    }
};

function findCity(query) {
    const q = query.toLowerCase().trim();
    for (const city of Object.keys(legalServicesData)) {
        if (q.includes(city) || city.includes(q)) return city;
    }
    // Aliases
    if (q.includes('bengaluru') || q.includes('blr')) return 'bangalore';
    if (q.includes('bombay')) return 'mumbai';
    if (q.includes('new delhi') || q.includes('ncr')) return 'delhi';
    if (q.includes('madras')) return 'chennai';
    if (q.includes('hyd') || q.includes('cyberabad')) return 'hyderabad';
    return null;
}

// GET /api/location/services?city=Delhi&type=all
router.get('/services', (req, res) => {
    const { city = 'Delhi', type = 'all' } = req.query;
    const cityKey = findCity(city);

    let data;
    let responseCity;

    if (!cityKey) {
        // Generate dynamic mock data for any requested city
        responseCity = city.charAt(0).toUpperCase() + city.slice(1);
        data = {
            policeStations: [
                { name: `${responseCity} Central Police Station`, address: `Main Road, ${responseCity}`, phone: '100', hours: '24/7' },
                { name: `${responseCity} City Police Station`, address: `Downtown, ${responseCity}`, phone: '100', hours: '24/7' }
            ],
            courts: [
                { name: `District & Sessions Court, ${responseCity}`, address: `Court Complex, ${responseCity}`, phone: '-', hours: 'Mon-Sat 10AM-5PM' }
            ],
            lawyers: [
                { name: `Advocate Chambers ${responseCity}`, specialization: 'General Practice, Criminal & Civil', address: `Near District Court, ${responseCity}`, phone: '-', hours: 'Mon-Sat 9AM-8PM' },
                { name: `${responseCity} Legal Associates`, specialization: 'Property & Family Law', address: `Market Road, ${responseCity}`, phone: '-', hours: 'Mon-Sat 10AM-5PM' }
            ],
            legalAid: [
                { name: `District Legal Services Authority`, address: `District Court Complex, ${responseCity}`, phone: '-', hours: 'Mon-Sat 10AM-5PM' }
            ],
            notary: [
                { name: `Registered Notary Public`, address: `Near Court Complex, ${responseCity}`, phone: '-', hours: 'Mon-Sat 9AM-6PM' }
            ]
        };
    } else {
        data = legalServicesData[cityKey];
        responseCity = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
    }

    let result = {};

    if (type === 'all' || type === 'policeStations' || type === 'policeStation') result.policeStations = data.policeStations;
    if (type === 'all' || type === 'courts' || type === 'court') result.courts = data.courts;
    if (type === 'all' || type === 'lawyers' || type === 'lawyer') result.lawyers = data.lawyers;
    if (type === 'all' || type === 'legalAid') result.legalAid = data.legalAid;
    if (type === 'all' || type === 'notary') result.notary = data.notary;

    res.json({ city: responseCity, ...result });
});

// GET /api/location/cities - List available cities
router.get('/cities', (req, res) => {
    res.json({ cities: Object.keys(legalServicesData).map(c => c.charAt(0).toUpperCase() + c.slice(1)) });
});

module.exports = router;
