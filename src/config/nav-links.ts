
import { Home, BarChart2, Calendar, Users, Settings, ClipboardList, BookOpen } from 'lucide-react';

export const navButtons = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart2,
  },
];

export const adminNavButtons = [
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart2,
    },
    {
        name: 'Manage Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        name: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
    }
]

export const facultyNavButtons = [
    {
        name: 'My Schedule',
        href: '/faculty/schedule',
        icon: Calendar,
    },
    {
        name: 'My Bookings',
        href: '/faculty/bookings',
        icon: ClipboardList,
    }
]

export const studentNavButtons = [
    {
        name: 'Book Slot',
        href: '/student/book',
        icon: BookOpen,
    },
    {
        name: 'My Appointments',
        href: '/student/appointments',
        icon: ClipboardList,
    }
]
