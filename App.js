import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { GeofencingEventType } from 'expo-location';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import * as TaskManager from 'expo-task-manager';

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
		{ id: 1, name: 'Campus do Vale', description: 'Endereço...', latitude: -30.035042740503524, longitude: -51.21054466813803,  radius: 1000, enabled: true },
	]);  

	const [historical, setHistorical] = useState([
		{ id: 3, name: 'Mercearia', description: 'Endereço...', latitude: 0, longitude: 0, radius: 20, createdAt: new Date() }
	]);
	const [expoPushToken, setExpoPushToken] = useState('');
	const [notification, setNotification] = useState(false);
	const notificationListener = useRef();
	const responseListener = useRef();
	let regions = [];

	const route = useRoute();
    const newAlarm = route.params?.newAlarm;
	let regionsEnabled = [];

	// Push Notification
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

		return token;
	  }

	// Caso ocorra toggle alarm dar update em geofence
	const toggleAlarm = (name) => {
		setFavorite((prevState) =>
			prevState.map((item) =>
				item.name === name ? { ...item, enabled: !item.enabled } : item
			)
		);
	};
	
	useEffect(() => {
	  TaskManager.defineTask("LOCATION_GEOFENCE", async ({ data: { eventType, region }, error }) => {
		if (error) {
		  return;
		}
		if (eventType === GeofencingEventType.Enter) {
		  console.log("You've entered region:", region);
		  await Notifications.scheduleNotificationAsync({
			content: {
				title: 'You reached ' + region.identifier,
				body: 'You reached your destination'
			},
			trigger: { seconds: 1 },
		});

		  toggleAlarm(region.identifier)
		}
	  });
	}, [])

	useEffect(() => {
		favorite.forEach(fav => {
			if (fav.enabled) {
				regionsEnabled.push({identifier: fav.name, latitude:fav.latitude, longitude:fav.longitude, radius:fav.radius, notifyOnEnter: true})
			}
		});
		regions = regionsEnabled
		regionsEnabled = []
		regions.length !== 0? Location.startGeofencingAsync("LOCATION_GEOFENCE", regions) : Location.stopGeofencingAsync("LOCATION_GEOFENCE", regions)
    }, [favorite]);



	// Push Notification
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

	// Receive alarm
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
			const backgroundPermission = await Location.requestBackgroundPermissionsAsync()
				if (backgroundPermission.granted) {
					backgroundSubscrition = Location.startLocationUpdatesAsync(
						"LOCATION_GEOFENCE", {
							accuracy: Location.Accuracy.BestForNavigation,
							distanceInterval: 1, // minimum change (in meters) betweens updates
							deferredUpdatesInterval: 1000 // minimum interval (in milliseconds) between updates
						})
					}
			setExpoPushToken(token);

		})();
	}, []);

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
				<TouchableOpacity onPress={() => toggleAlarm(item.name)}>
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