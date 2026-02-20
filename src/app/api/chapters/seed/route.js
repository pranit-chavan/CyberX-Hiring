import dbConnect from '../../../../../lib/mongodb';
import Chapter from '../../../../../models/Chapter';

// POST /api/chapters/seed — Seed initial chapter data
export async function POST() {
    try {
        await dbConnect();

        const existingCount = await Chapter.countDocuments();
        if (existingCount > 0) {
            return Response.json({ message: `Already have ${existingCount} chapters. Skipping seed.` });
        }

        const chapters = [
            {
                city: 'Nashik',
                state: 'Maharashtra',
                status: 'active',
                lead: 'Pranit Chavan',
                members: '50+',
                events: 12,
                description: 'The flagship chapter where it all began. CyberX Nashik leads the way in CTF competitions, workshops, and community-driven cybersecurity initiatives.',
                founded: '2023',
                linkedin: 'https://www.linkedin.com/company/cyberx-nashik-community/',
                instagram: 'https://www.instagram.com/cyberx.nashik',
                highlights: ['CTF Competitions', 'Monthly Meetups', 'Workshops'],
            },
            {
                city: 'Pune',
                state: 'Maharashtra',
                status: 'coming-soon',
                description: 'Expanding to the tech hub of Maharashtra. Be the first to launch CyberX in Pune and build a thriving cybersecurity community.',
                highlights: ['Red Team Labs', 'Industry Talks', 'Bug Bounty Hunts'],
            },
            {
                city: 'Mumbai',
                state: 'Maharashtra',
                status: 'coming-soon',
                description: 'Bringing cybersecurity awareness to the financial capital. Mumbai chapter will focus on enterprise security and fintech protection.',
                highlights: ['Enterprise Security', 'FinTech Defense', 'Networking Events'],
            },
            {
                city: 'Bangalore',
                state: 'Karnataka',
                status: 'coming-soon',
                description: "India's Silicon Valley awaits. The Bangalore chapter will connect cybersecurity enthusiasts with the startup ecosystem.",
                highlights: ['Startup Security', 'Cloud Defense', 'Hack Nights'],
            },
            {
                city: 'Hyderabad',
                state: 'Telangana',
                status: 'coming-soon',
                description: "Cyberabad meets CyberX. Hyderabad chapter will tap into the city's thriving IT and defense technology landscape.",
                highlights: ['Threat Intelligence', 'SOC Training', 'Capture The Flag'],
            },
            {
                city: 'Delhi NCR',
                state: 'Delhi',
                status: 'coming-soon',
                description: 'Connecting cybersecurity professionals across the National Capital Region. Policy, governance, and hands-on hacking combined.',
                highlights: ['Cyber Policy', 'GRC Meetups', 'Pen Testing Labs'],
            },
        ];

        const created = await Chapter.insertMany(chapters);
        return Response.json({ message: `Seeded ${created.length} chapters`, chapters: created }, { status: 201 });
    } catch (error) {
        console.error('Error seeding chapters:', error);
        return Response.json({ error: 'Failed to seed chapters' }, { status: 500 });
    }
}
