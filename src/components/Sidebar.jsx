import React from 'react';
import { FaTachometerAlt, FaUserGraduate, FaMoneyBillWave, FaSolarPanel, FaPlaneDeparture, FaRecycle, FaTint, FaBolt, FaFire, FaArrowCircleUp } from 'react-icons/fa';

// Assign a unique color to each dashboard
const dashboards = [
    {
        key: 'main',
        label: 'Master Dashboard',
        icon: FaTachometerAlt,
        color: '#4f8cff', // blue
    },
    {
        key: 'student',
        label: 'Population',
        icon: FaUserGraduate,
        color: '#8884d8', // purple
    },
    {
        key: 'finance',
        label: 'Budget',
        icon: FaMoneyBillWave,
        color: '#00b894', // teal
    },
    {
        key: 'solar',
        label: 'PV Solar',
        icon: FaSolarPanel,
        color: '#f9ca24', // yellow
    },
    {
        key: 'waste',
        label: 'Waste',
        icon: FaRecycle,
        color: '#27ae60', // green
    },
    {
        key: 'water',
        label: 'Water',
        icon: FaTint,
        color: '#3498db', // light blue
    },
    {
        key: 'electricity',
        label: 'Electricity',
        icon: FaBolt,
        color: '#e74c3c', // orange power
    },
    {
        key: 'naturalgas',
        label: 'Natural Gas',
        icon: FaFire,
        color: '#17a2b8', // deep teal
    },
    {
        key: 'travel',
        label: 'Business Travel',
        icon: FaPlaneDeparture,
        color: '#e17055', // orange
    },
];

function Sidebar({ onPushToMain, currentDashboard, onDashboardChange }) {
    return (
        <nav style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
            }}>
                {dashboards.map(dash => (
                    <li key={dash.key} style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            className={`sidebar-icon-btn sidebar-icon-btn-${dash.key}${dash.key === currentDashboard ? ' selected' : ''}`}
                            style={{
                                width: '100%',
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                background: dash.key === currentDashboard ? 'rgba(136,132,216,0.12)' : 'transparent',
                                color: dash.key === currentDashboard ? dash.color : '#b0bed9',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: 24,
                                cursor: dash.key === currentDashboard ? 'default' : 'pointer',
                                boxShadow: dash.key === currentDashboard ? '0 2px 8px rgba(136,132,216,0.08)' : 'none',
                                transition: 'background 0.2s, color 0.2s',
                                position: 'relative',
                                paddingLeft: 18,
                                gap: 14,
                            }}
                            title={dash.label}
                            disabled={dash.key === currentDashboard}
                            onClick={() => onDashboardChange && onDashboardChange(dash.key)}
                        >
                            {React.createElement(dash.icon, { size: 24, color: dash.key === currentDashboard ? dash.color : 'inherit' })}
                            <span className="sidebar-label" style={{ fontSize: 16, fontWeight: dash.key === currentDashboard ? 600 : 400, color: 'inherit', transition: 'color 0.2s' }}>{dash.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
            <div style={{ width: '100%', padding: '24px 0 0 0', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={onPushToMain}
                    style={{
                        width: '92%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 14,
                        background: 'linear-gradient(90deg, #8884d8 0%, #4f8cff 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 22px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(136,132,216,0.10)',
                        transition: 'background 0.2s, color 0.2s',
                        marginBottom: 12,
                    }}
                    title="Push current growth rate to Main Dashboard"
                >
                    <span style={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}><FaArrowCircleUp size={22} /></span>
                    <span style={{ flex: 1, textAlign: 'center' }}>Push to Main Dashboard</span>
                </button>
            </div>
        </nav>
    );
}

export default Sidebar;