import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedRoutes = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(()=>{
        if(!user){
            navigate("/login");
            return;
        }

        // Check for admin routes
        if(location.pathname === '/admin' && !user.isAdmin){
            navigate('/');
        }
    },[user, location.pathname]);

    return <>{children}</>
}

export default ProtectedRoutes;