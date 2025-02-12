import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import Logout from './Logout';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const user = useRecoilValue(userState);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              {user?.profile_img ? (
                <img
                  src={user.profile_img}
                  alt="Profile"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all duration-300"
                />
              ) : (
                <UserCircleIcon className="h-12 w-12 text-purple-500" />
              )}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Welcome back,</p>
              <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
            </div>
          </div>
          <Logout />
        </div>
      </div>
    </header>
  );
};

export default Header; 