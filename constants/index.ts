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
        link: process.env.STRIPE_PAYMENT_LINK_MONTHLY_SUBSCRIPTION,
        priceId: process.env.STRIPE_PRODUCT_ID_MONTHLY_SUBSCRIPTION,
        price: 5,
        duration: '/Month',
    },
    {
        link: process.env.STRIPE_PAYMENT_LINK_YEARLY_SUBSCRIPTION,
        priceId: process.env.STRIPE_PRODUCT_ID_YEARLY_SUBSCRIPTION,
        price: 45,
        duration: '/Year',
    },
]