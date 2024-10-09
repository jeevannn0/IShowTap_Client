/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql, useMutation, useQuery } from '@apollo/client'; // GraphQL query and mutation hooks
import { Player } from '@lottiefiles/react-lottie-player';
import { useEffect, useRef, useState } from 'react'; // React hooks
import animationData from './images/coin.json';
import image from './images/tapcoin.json'; // Animation for tap button
import { dailyCipher, dailyCombo, dailyReward, } from './images';


// Declare the global Telegram WebApp interface to access the user data
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            username: string;
            first_name: string;
            last_name?: string;
          };
        };
      };
    };
  }
}

// GraphQL query to get the user details
const GET_USER = gql`
  query GetUser($chat_id: Int!) {
    getUser(chat_id: $chat_id) {
      id
      name
      coin_balance
      chat_id
    }
  }
`;

// GraphQL mutation to update the coin balance
const UPDATE_COINS_MUTATION = gql`
  mutation UpdateCoins($chat_id: Int!, $coins: Int!) {
    updateCoins(chat_id: $chat_id, coins: $coins) {
      id
      coin_balance
      chat_id
    }
  }
`;
// GraphQL mutation to sync coins
const SYNC_COINS = gql`
  mutation SyncCoins($chat_id: Int!, $offlineCoins: Int!) {
    syncCoins(chat_id: $chat_id, offlineCoins: $offlineCoins) {
      id
      name
      coin_balance
    }
  }
`;
const App = () => {
  const [coins, setCoins] = useState(0); // Store the coin balance
  const [username, setUsername] = useState<string | null>(null); // Store the user's username
  const [chatId, setChatId] = useState<number | null>(null); // Store the chat ID from Telegram WebApp
  const playerRef = useRef<Player>(null); // Reference for the coin Lottie animation
  const buttonPlayerRef = useRef<Player>(null); // Reference for the tap button Lottie animation
  const buttonRef = useRef<HTMLButtonElement>(null); // Reference for the button element
  const [showPlusOne, setShowPlusOne] = useState(false); // Control to show the '+1' animation
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Initialize based on current status
  const [offlineCoins, setOfflineCoins] = useState(0); // Coins earned offline
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  console.log(offlineCoins, syncError);
  // Fetch user data from the GraphQL API
  const {
    data: userData,
    error: userError,
    refetch,
  } = useQuery(GET_USER, {
    variables: { chat_id: chatId }, // Fetch user by chat ID
    skip: !chatId, // Skip the query if chatId is not available
  });

  // GraphQL mutation hook for updating coins
  const [updateCoins, { error: updateError }] = useMutation(
    UPDATE_COINS_MUTATION
  );
  // GraphQL mutation hook for syncing coins
  const [syncCoins] = useMutation(SYNC_COINS);

  // On component mount, extract Telegram user data from the WebApp interface
  useEffect(() => {
    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    if (tgUser) {
      setChatId(tgUser.id); // Set chat ID
      setUsername(
        tgUser.username || `${tgUser.first_name} ${tgUser.last_name || ''}`
      ); // Set username
    }
  }, []);

  // When user data is fetched, update the coin balance
  useEffect(() => {
    if (userData?.getUser) {
      console.log('User data received:', userData.getUser);
      setCoins(userData.getUser.coin_balance); // Set coins from fetched data
    }
    if (userError) {
      console.error('Error fetching user data:', userError);
    }
  }, [userData, userError]);

  // Handle tap action, updating coins and triggering animations
  const handleTap = async () => {
    setShowPlusOne(true); // Show '+1' animation
    setTimeout(() => setShowPlusOne(false), 1000); // Hide the animation after 1 second
    playerRef.current?.setSeeker(50); // Adjust animation timing
    playerRef.current?.play(); // Play coin animation
    buttonPlayerRef.current?.setPlayerSpeed(5); // Speed up tap animation
    buttonPlayerRef.current?.play(); // Play tap animation

    const newCoinBalance = coins + 1; // Increment coin balance locally
    setCoins(newCoinBalance); // Update state with new coin balance

    if (isOnline) {
      // Update the coin balance in the backend
      try {
        if (chatId) {
          console.log(
            'Updating coins for chat_id:',
            chatId,
            'New balance:',
            newCoinBalance
          );
          const { data } = await updateCoins({
            variables: {
              chat_id: chatId, // Send chat ID and new coin balance to GraphQL mutation
              coins: newCoinBalance,
            },
          });
          console.log('Coin balance updated', data);
          refetch(); // Refetch user data to ensure UI is up-to-date
        } else {
          console.error('Chat ID is not available');
        }
      } catch (error) {
        console.error('Error updating coin balance:', error);
        setCoins(coins); // Revert coin balance if update fails
      }
    } else {
      // Offline, so store the coins locally
      const storedCoins = Number(localStorage.getItem('offlineCoins')) || 0;
      const newTotal = storedCoins + 1;
      localStorage.setItem('offlineCoins', newTotal.toString());
      setOfflineCoins(newTotal); // Update the state to reflect locally stored coins
    }
  };
  // Function to sync offline coins to the server
  const syncCoinsToServer = async () => {
    const storedCoins = Number(localStorage.getItem('offlineCoins')) || 0;
    if (storedCoins > 0) {
      setIsSyncing(true);
      setSyncError(null);

      try {
        // Make the mutation request
        await syncCoins({
          variables: {
            chat_id: chatId, // Replace with actual chat_id
            offlineCoins: storedCoins,
          },
        });

        // Clear offline coins after syncing
        localStorage.removeItem('offlineCoins');
        setOfflineCoins(0);
        setIsSyncing(false);
        console.log('Coins synced successfully.');
      } catch (error) {
        console.error('Error syncing coins:', error);
        setSyncError('Failed to sync. Will retry when online.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Sync coins when the user comes online
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    if (isOnline) {
      syncCoinsToServer();
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [isOnline]);
  // Render error messages if data fetching or mutation fails
  if (userError) return <p>Error loading user data</p>;
  if (updateError) return <p>Error updating coins</p>;

  return (
    <div className="bg-black flex justify-center">
    <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
      <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
        <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">

        <div className='flex items-center ml-7 gap-80 mt-5'>
        <div className='bg-base-300 text-base-content px-4 py-2 rounded-md h-full flex justify-center items-center'>
          <p className='lg:text-xl font-bold sm:text-xs'>
            {' '}
            Player :  {username}!{' '}
          </p>
        </div>
        <div className='bg-base-300 rounded-md text-base-content flex justify-center items-center pr-4 gap-2'>
          <Player src={animationData} ref={playerRef} className='h-9 w-9' /> {/* Coin animation */}
          <p className='lg:text-xl font-bold sm:text-xs'>{coins}</p>{' '}
          {/* Display coin balance */}
        </div>
      </div>


        <div className="px-4 mt-6 flex justify-between gap-2">
              <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-full relative">
                <img src={dailyReward} alt="Daily Reward" className="mx-auto w-12 h-12" />
                <p className="text-[10px] text-center text-white mt-1">Daily reward</p>
                <p className="text-[10px] font-medium text-center text-gray-400 mt-2"></p>
              </div>
              <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-full relative">
                <img src={dailyCipher} alt="Daily Cipher" className="mx-auto w-12 h-12" />
                <p className="text-[10px] text-center text-white mt-1">Daily cipher</p>
                <p className="text-[10px] font-medium text-center text-gray-400 mt-2"></p>
              </div>
              <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-full relative">
                <img src={dailyCombo} alt="Daily Combo" className="mx-auto w-12 h-12" />
                <p className="text-[10px] text-center text-white mt-1">Daily combo</p>
                <p className="text-[10px] font-medium text-center text-gray-400 mt-2"></p>
              </div>
            </div>

         
    <div className='h-screen flex flex-col items-center justify-center -mt-28 gap-4'>
      {!isOnline && (
        <span className='badge badge-neutral'>
          You're offline. Coins will sync when you reconnect.
        </span>
      )}
      {isSyncing && (
        <span className='badge badge-neutral'>Syncing coins...</span>
      )}
    
      {/* Tap button with animation */}
      <button className='w-[60%]' onClick={handleTap} ref={buttonRef} >
        <Player
          src={image}
          style={{ width: '100%', height: '100%' }}
          ref={buttonPlayerRef}
        />
        {showPlusOne && (
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 text-lg font-bold text-white animate-ping'>
            +1
          </div>
        )}
      </button>

     
    </div>
    </div>
        </div>
      </div>
    </div>
  );
};

export default App;
