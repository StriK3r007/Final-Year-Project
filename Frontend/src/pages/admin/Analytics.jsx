// * Modern UI
// Analytics.jsx
// A React component that fetches and displays analytics data for the
// bus management system, including total counts of buses, routes,
// drivers, and stops.

import React, {
    useEffect,
    useState
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Stack
} from "@mui/material";
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// A reusable component for a consistent look on each analytics card.
const AnalyticsCard = ({
    title,
    value,
    icon,
    color,
    bgColor
}) => {
    return (
        <Card sx={{
            backgroundColor: bgColor,
            borderRadius: 3,
            boxShadow: 3,
            minHeight: 150,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6,
            }
        }}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{
                        color: color,
                        backgroundColor: '#fff',
                        p: 2,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{
                            fontWeight: 'normal',
                            color: '#fff'
                        }}>
                            {title}
                        </Typography>
                        <Typography variant="h3" sx={{
                            fontWeight: 'bold',
                            color: '#fff',
                            mt: 1
                        }}>
                            {value}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

const Analytics = () => {
    // State to hold the fetched data
    const [analyticsData, setAnalyticsData] = useState({
        buses: 0,
        routes: 0,
        drivers: 0,
        stops: 0,
    });
    // State to track loading status
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Fetch analytics data from the backend APIs
    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            // Fetch data for all categories concurrently
            const [busesRes, routesRes, driversRes, stopsRes] = await Promise.all([
                axios.get("/api/buses", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                axios.get("/api/routes", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                axios.get("/api/drivers", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                axios.get("/api/stops", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
            ]);

            // Update state with the counts from the API responses
            setAnalyticsData({
                buses: busesRes.data.length,
                routes: routesRes.data.length,
                drivers: driversRes.data.length,
                stops: stopsRes.data.length,
            });
        } catch (err) {
            console.error("Failed to fetch analytics data:", err);
            toast.error("Failed to fetch analytics data. Please check the server connection.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when the component mounts
    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    // Display a loading indicator while fetching data
    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    // Render the analytics dashboard
    return (
        <Box sx={{
            padding: 3
        }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{
                fontWeight: 'bold',
                color: 'text.primary'
            }}>
                Dashboard Analytics
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <AnalyticsCard
                        title="Total Buses"
                        value={analyticsData.buses}
                        icon={<DirectionsBusIcon sx={{
                            fontSize: 35
                        }} />}
                        bgColor="#42a5f5"
                        color="#42a5f5"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <AnalyticsCard
                        title="Total Routes"
                        value={analyticsData.routes}
                        icon={<RouteIcon sx={{
                            fontSize: 35
                        }} />}
                        bgColor="#66bb6a"
                        color="#66bb6a"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <AnalyticsCard
                        title="Total Drivers"
                        value={analyticsData.drivers}
                        icon={<PeopleIcon sx={{
                            fontSize: 35
                        }} />}
                        bgColor="#ffa726"
                        color="#ffa726"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <AnalyticsCard
                        title="Total Stops"
                        value={analyticsData.stops}
                        icon={<LocationOnIcon sx={{
                            fontSize: 35
                        }} />}
                        bgColor="#ef5350"
                        color="#ef5350"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;
