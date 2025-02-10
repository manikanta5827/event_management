import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import Logout from './Logout';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const user = useRecoilValue(userState);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {user?.profile_img ? (
              <img
                src={user.profile_img}
                alt="Profile"
                className="h-14 w-14 rounded-full object-cover border-2 border-purple-200"
              />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-purple-500" />
            )}
            <div className="ml-3">
              <p className="text-sm text-gray-600">Hi,</p>
              <p className="text-base font-medium text-gray-800">{user?.name}</p>
            </div>
          </div>
          <Logout />
        </div>
      </div>
    </header>
  );
};

export default Header; 