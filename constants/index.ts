export const sidebarLinks = [
    {
        route: '/dashboard',
        label: 'Dashboard',
        imgURL: '/icons/home.svg'
    },
    {
        route: '/flight',
        label: 'My Flight',
        imgURL: '/icons/play.svg'
    },
    {
        route: '/profile',
        label: 'Account Settings',
        imgURL: '/icons/profile.svg'
    },
]

export const topbarLinks = [
    {
        route: '/',
        label: 'Home',
        imgURL: '/icons/home.svg'
    },
    {
        route: '/features',
        label: 'Features',
        imgURL: '/icons/home.svg'
    },
    {
        route: '/pricing',
        label: 'Pricing',
        imgURL: '/icons/home.svg'
    },
    {
        route: '/about',
        label: 'About',
        imgURL: '/icons/home.svg'
    },
]

export const plans = [
    {
        _id: 1,
        name: "MSFS CLC - Montly Subscription",
        icon: "/assets/icons/free-plan.svg",
        price: 5,
        inclusions: [
            {
                label: "Feature 1",
                isIncluded: true,
            },
            {
                label: "Feature 2",
                isIncluded: true,
            },
            {
                label: "Feature 3",
                isIncluded: true,
            },
            {
                label: "Feature 4",
                isIncluded: true,
            },
        ]
    },
    {
        _id: 1,
        name: "MSFS CLC - Yearly Subscription",
        icon: "/assets/icons/free-plan.svg",
        price: 50,
        inclusions: [
            {
                label: "Feature 1",
                isIncluded: true,
            },
            {
                label: "Feature 2",
                isIncluded: true,
            },
            {
                label: "Feature 3",
                isIncluded: true,
            },
            {
                label: "Feature 4",
                isIncluded: true,
            },
        ]
    }
]