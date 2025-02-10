import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState, loadingState } from '../store/atoms';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const user = useRecoilValue(userState);
  const loading = useRecoilValue(loadingState);

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute; 