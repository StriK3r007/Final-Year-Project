// // components/Navbar/Navbar.jsx
// import { useEffect, useState } from 'react';
// import SearchBar from './SearchBar';
// import UserMenu from './UserMenu';
// import axios from 'axios';

// export default function Navbar({onSelectStop}) {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Fetch current user if logged in
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (token) {
//           const res = await axios.get('/api/auth/me', {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           setUser(res.data);
//         }
//       } catch (err) {
//         if (err.response?.status === 401) {
//           console.warn("Session expired. Logging out...");
//           localStorage.removeItem("token");
//           window.location.href = "/login"; // or use your router to redirect
//   }
//         // console.error('Failed to fetch user:', err);
//       }
//     };
    
//     fetchUser();
//   }, []);

//   return (
//     <div className="w-full shadow-md p-2 bg-white flex justify-between items-center z-1">
//       <SearchBar onSelectStop={onSelectStop} />
//       {/* <SearchBar onSelectStop={onSelectStop}  onSelectStop={(stop) => console.log("Selected stop:", stop)} /> */}
//       <UserMenu user={user} />
//     </div>
//   );
// }







// NavBar.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

// Main Navbar component with modern styling
export default function Navbar({ onSelectStop }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch current user if logged in
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("Session expired. Logging out...");
          localStorage.removeItem("token");
          window.location.href = "/login"; // or use your router to redirect
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{
        justifyContent: 'space-between',
        py: 1,
        px: 3
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#388e3c', display: { xs: 'none', sm: 'block' } }}>
            Green Bus Tracker
          </Typography>
        </Box>
        {/* <SearchBar onSelectStop={onSelectStop} /> */}
        <UserMenu user={user} />
      </Toolbar>
    </AppBar>
  );
}