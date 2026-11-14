import { useState, useEffect } from 'react';
import { authApi } from '../Api/authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Share one profile request across all mounted components (e.g. every product card).
let cachedUser = null;
let profileChecked = false;
let profileRequest = null;
let authRevision = 0;

export const setAuthUser = (user) => {
  authRevision += 1;
  cachedUser = user;
  profileChecked = true;
  profileRequest = null;
};

const useAuth = () => {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!profileChecked);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (profileChecked) {
      setUser(cachedUser);
      setLoading(false);
    } else {
      if (!profileRequest) {
        const requestRevision = authRevision;
        profileRequest = authApi.getProfile()
          .then((profile) => {
            if (requestRevision === authRevision) cachedUser = profile;
            return requestRevision === authRevision ? profile : cachedUser;
          })
          .catch(() => {
            if (requestRevision === authRevision) cachedUser = null;
            return requestRevision === authRevision ? null : cachedUser;
          })
          .finally(() => {
            if (requestRevision === authRevision) profileChecked = true;
          });
      }
      profileRequest.then((profile) => {
        if (active) { setUser(profile); setLoading(false); }
      });
    }
    return () => { active = false; };
  }, []);

  const logout = async () => {
    try { await authApi.logout(); } finally {
      localStorage.removeItem('token');
      setAuthUser(null);
      setUser(null);
      navigate('/login');
    }
  };

  const requireLogin = (callback) => {
    if (!user) {
      toast.warning('Please login to add items to cart');
      navigate('/login');
      return false;
    }
    callback();
    return true;
  };

  return { user, loading, logout, requireLogin };
};

export default useAuth;
