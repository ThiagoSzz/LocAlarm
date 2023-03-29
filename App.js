import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import NewAlarmScreen from './NewAlarm';
import SettingsScreen from './Settings';
import styles from './Styles';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
	  shouldShowAlert: true,
	  shouldPlaySound: true,
	  shouldSetBadge: true,
	}),
  });

const HomeScreen = ({ navigation }) => {
	let [currId, setCurrId] = useState(5);
	const [favorite, setFavorite] = useState([
		{ id: 1, name: 'Campus do Vale', description: 'Endereço...', latitude: 0, longitude: 0, radius: 10, enabled: true },
	]);  

	const [historical, setHistorical] = useState([
		{ id: 3, name: 'Mercearia', description: 'Endereço...', latitude: 0, longitude: 0, radius:0, createdAt: new Date() }
	]);
	const [expoPushToken, setExpoPushToken] = useState('');
	const [notification, setNotification] = useState(false);
	const notificationListener = useRef();
	const responseListener = useRef();

	const route = useRoute();
    const newAlarm = route.params?.newAlarm;

	


	// Devolve em metros distância entre latitudes
	function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2-lat1);  // deg2rad below
		var dLon = deg2rad(lon2-lon1); 
		var a = 
		  Math.sin(dLat/2) * Math.sin(dLat/2) +
		  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
		  Math.sin(dLon/2) * Math.sin(dLon/2)
		  ; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}
	  
	function deg2rad(deg) {
		return deg * (Math.PI/180)
	}


	async function registerForPushNotificationsAsync() {
		let token;
	  
		if (Platform.OS === 'android') {
		  await Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
		  });
		}
	  
		  const { status: existingStatus } = await Notifications.getPermissionsAsync();
		  let finalStatus = existingStatus;
		  if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		  }
		  if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!');
			return;
		  }
		  token = (await Notifications.getExpoPushTokenAsync()).data;
		  console.log(token);

	  
		return token;
	  }

	useEffect(() => {
		registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
	
		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
		  setNotification(notification);
		});
	
		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
		  console.log(response);
		});
	
		return () => {
		  Notifications.removeNotificationSubscription(notificationListener.current);
		  Notifications.removeNotificationSubscription(responseListener.current);
		};
	  }, []);

	useEffect(() => {
        if (newAlarm) {
			var localId = incrementId();
        	setHistorical([...historical, { ...newAlarm, id: localId, createdAt: new Date(newAlarm.createdAt) }]);
        }
    }, [newAlarm]);


	useEffect(() => {
		(async () => {
			let { status } = await Notifications.requestPermissionsAsync();
			if (status !== 'granted') {
				alert('Failed to get push token for push notification!');
				return;
			}
			let token = (await Notifications.getExpoPushTokenAsync()).data;
			setExpoPushToken(token);
		})();
	}, []);

	useEffect(() => {
        const getMyPosition = async () => {
          
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }

          let location = await Location.getCurrentPositionAsync({});
		  
		  console.log(favorite)
		  favorite.forEach(async fav => {
			distance = getDistanceFromLatLonInKm(location.coords.latitude, location.coords.longitude, fav.latitude, fav.longitude)
			if (fav.enabled) {
				if(distance < fav.radius){
					// Send a notification
					console.log('Notificação')
					await Notifications.scheduleNotificationAsync({
						content: {
							title: 'Favorite Location Alert',
							body: 'You are close to your favorite location!'
						},
						trigger: { seconds: 1 },
					});
				} else { 
					// send nothing
				}
			}
			});
		  };
		  
		const interval = setInterval(() => {
			getMyPosition()
		}, 6000);
		return () => clearInterval(interval);
      }, [favorite]);

	function incrementId () {
		setCurrId(currId + 1);

		return currId + 1;
	};

	const historicalToFavorite = ({ item }) => {
		const index = historical.indexOf(item);
		const removed = historical.splice(index, 1)[0];

		const localId = incrementId();
		setFavorite([...favorite, { ...removed, id: localId, enabled: true }]);
	};
	  
	const toggleAlarm = (id) => {
		setFavorite((prevState) =>
			prevState.map((item) =>
				item.id === id ? { ...item, enabled: !item.enabled } : item
			)
		);
		console.log(favorite)
	};

	const showItemFavorite = ({ item }) => {
		return (
			<View style={styles.listItem}>
				<View style={{ flex: 1 }}>
				<Text style={styles.alarmName}>{item.name}</Text>
				<Text style={styles.alarmDescription}>{item.description}</Text>
				</View>
				<TouchableOpacity onPress={() => navigation.navigate('AllarmSettings')}>
					<FontAwesome name="cog" size={30} color="#888888" style={{ marginRight: 15 }}/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => toggleAlarm(item.id)}>
					{item.enabled ? (
						<FontAwesome name="toggle-on" size={40} color="#4CD964"/>
					) : (
						<FontAwesome name="toggle-off" size={40} color="#C7C7CC"/>
					)}
				</TouchableOpacity>
			</View>
		);
	};

	const showItemHistorical = ({ item }) => {
		return (
		<View style={styles.listItem}>
			<View style={{ flex: 1 }}>
			<Text style={styles.alarmName}>{item.name}</Text>
			<Text style={styles.alarmDescription}>Criado em {item.createdAt.toLocaleDateString()} às {item.createdAt.toLocaleTimeString()}</Text>
			</View>
			<TouchableOpacity>
				<FontAwesome name="star" onPress={() => historicalToFavorite({ item })} size={32} color="#FFD700" style={{ marginRight: 15 }}/>
			</TouchableOpacity>
		</View>
		);
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
			<View style={styles.header}>
				<Text style={{ fontSize: 24, color: 'black', fontWeight: 'bold' }}>LocAlarm</Text>				
				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity onPress={() => navigation.navigate('NewAlarm')}>
						<FontAwesome name="plus" size={25} style={{ color: 'black',	marginLeft: 25 }}/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate('Settings')}>
						<FontAwesome name="cog" size={25} style={{ color: 'black',	marginLeft: 25 }}/>
					</TouchableOpacity>
				</View>
			</View>

			<View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
				<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Favoritos</Text>
			</View>
			<FlatList style={{ paddingHorizontal: 15, height: 250 }} data={favorite} keyExtractor={(item) => item.id.toString()} renderItem={showItemFavorite}/>
			
			<View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
				<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Histórico</Text>
			</View>
			<FlatList style={{ paddingHorizontal: 15 }}	data={historical} renderItem={showItemHistorical}/>
		</View>
	);
}

const Stack = createStackNavigator();

function App() {
	return (
	  <NavigationContainer>
		<Stack.Navigator>
		  <Stack.Screen name="Alarms" component={HomeScreen}/>
		  <Stack.Screen name="NewAlarm" component={NewAlarmScreen}/>
		  <Stack.Screen name="Settings" component={SettingsScreen}/>
		</Stack.Navigator>
	  </NavigationContainer>
	);
}

export default App;