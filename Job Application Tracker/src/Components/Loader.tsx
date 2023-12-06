import { useSelector } from 'react-redux';
import { RingLoader } from 'react-spinners';

interface LoaderState {
  loading: boolean;
}

const Loader = () => {
  const isLoading = useSelector((state: LoaderState) => state.loading);

  return (
    <div className="loader">
      <RingLoader color={'#36d7b7'} loading={isLoading} />
    </div>
  );
};

export default Loader;