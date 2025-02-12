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
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
                            Events Dashboard
                        </span>
                    </div>
                </div>
                <div className="mt-8">
                    <ErrorBoundary>
                        <Events />
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    );
};

export default Home;