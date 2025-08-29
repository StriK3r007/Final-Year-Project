// // components/Navbar/UserMenu.jsx
// import { useState } from 'react';
// import { LogIn, UserPlus, LogOut } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// export default function UserMenu({ user }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const navigate = useNavigate();

//   const initials = user?.name
//     ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
//     : '';

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-bold hover:bg-gray-300 transition"
//       >
//         {user?.name ? (
//           <span
//             className="text-green-500"
//           >{initials}</span>
//         ) : (
//           <UserPlus size={20} />
//         )}
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50 border">
//           {!user ? (
//             <div className="p-2">
//               <button
//                 onClick={() => navigate('/login')}
//                 className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm mt-2"
//               >
//                 <LogIn size={16} className="mr-2" /> Login
//               </button>
//               <button
//                 onClick={() => navigate('/signup')}
//                 className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm mt-2"
//               >
//                 <UserPlus size={16} className="mr-2" /> Signup
//               </button>
//             </div>
//           ) : (
//             <div className="p-2">
//               <div className="px-4 py-2 text-sm text-gray-600">Hi, {user.name}</div>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-500"
//               >
//                 <LogOut size={16} className="mr-2" /> Logout
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }



// UserMenu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Avatar,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';

export default function UserMenu({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    handleClose();
    navigate('/login');
  };

  const handleLogin = () => {
    handleClose();
    navigate('/login');
  };

  const handleSignup = () => {
    handleClose();
    navigate('/signup');
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        {user ? (
          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40, fontSize: 16 }}>
            {initials}
          </Avatar>
        ) : (
          <AccountCircle sx={{ color: 'grey.500' }} />
        )}
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
      >
        {user ? (
          <Box>
            <Typography variant="body2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
              Hi, {user.name}
            </Typography>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Box>
        ) : (
          <Box>
            <MenuItem onClick={handleLogin}>
              <LoginIcon sx={{ mr: 1 }} /> Login
            </MenuItem>
            <MenuItem onClick={handleSignup}>
              <PersonAddIcon sx={{ mr: 1 }} /> Signup
            </MenuItem>
          </Box>
        )}
      </Menu>
    </Box>
  );
}
