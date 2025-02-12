// import { useRecoilValue } from 'recoil';
// import { userState } from '../store/atoms';
import Header from '../components/Header';
import Events from '../components/Events';
import ErrorBoundary from '../components/ErrorBoundary';

const Home = () => {
    // const user = useRecoilValue(userState);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <ErrorBoundary>
                    <Events />
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default Home;