import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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

let regionsTask = []

TaskManager.defineTask("LOCATION_GEOFENCE", async ({ data: { eventType, region }, error }) => {
	
	let isRegionIn = 0

	if(region) {
		isRegionIn = regionsTask.findIndex(element => {
			if (element === region.identifier) {
			  return true;
			}
		  });
	}
	
	if (error) {
	  return;
	}
	
	if (eventType === GeofencingEventType.Enter && isRegionIn === -1) {
	  regionsTask.push(region.identifier)
	  await Notifications.scheduleNotificationAsync({
		content: {
			title: 'You reached ' + region.identifier,
			body: 'You reached your destination'
		},
		trigger: { seconds: 1 },
	});
	}
});

const Card = ({ imageUrl, title, description, enabled, onToggle }) => {
    const [toggle, setToggle] = useState(enabled);
	const selectedDays = ['Dom','Seg','Qui','Sex'];

    const toggleHandler = () => {
        setToggle(!enabled);
        onToggle();
    };

    return (
        <View style={styles.card}>
			<Image source={{ uri: imageUrl }} style={styles.cardImage}/>
			<View style={styles.cardContent}>
				<Text style={styles.cardTitle} numberOfLines={1}>{title.length >= 15 ? `${title.slice(0, 15)}...` : title}</Text>
				<View style={styles.circle}>
					<View style={styles.daysOfWeek}>
						<View style={[ styles.dayOfWeek, selectedDays.includes('Dom') ? styles.daySelected : styles.dayNotSelected ]}>
							<Text style={styles.dayOfWeekText}>D</Text>
						</View>
						<View style={[ styles.dayOfWeek, selectedDays.includes('Seg') ? styles.daySelected : styles.dayNotSelected ]}>
							<Text style={styles.dayOfWeekText}>S</Text>
						</View>
						<View style={[ styles.dayOfWeek, selectedDays.includes('Ter') ? styles.daySelected : styles.dayNotSelected ]}>
							<Text style={styles.dayOfWeekText}>T</Text>
						</View>
						<View style={[ styles.dayOfWeek, selectedDays.includes('Qua') ? styles.daySelected : styles.dayNotSelected ]}>
							<Text style={styles.dayOfWeekText}>Q</Text>
						</View>
						<View style={[ styles.dayOfWeek, selectedDays.includes('Qui') ? styles.daySelected : styles.dayNotSelected ]}>
							<Text style={styles.dayOfWeekText}>Q</Text>
						</View>
						<View style={[ styles.dayOfWeek, selectedDays.includes('Sex') ? styles.daySelected : styles.dayNotSelected ]}>
							<Text style={styles.dayOfWeekText}>S</Text>
						</View>
						<View style={[ styles.dayOfWeek, selectedDays.includes('Sab') ? styles.daySelected : styles.dayNotSelected ]}>
							<Text style={styles.dayOfWeekText}>S</Text>
						</View>
					</View>
				</View>
			</View>
			<View style={styles.cardActions}>
				<TouchableOpacity activeOpacity={0.7} style={{ backgroundColor: 'transparent' }}>
					<FontAwesome5 name="cog" size={28} color="#888888"/>
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleHandler} activeOpacity={0.7} style={{ backgroundColor: 'transparent' }}>
					<FontAwesome5 name={toggle ? 'toggle-on' : 'toggle-off'} size={35} color={toggle ? '#4CD964' : '#C7C7CC'}/>
				</TouchableOpacity>
			</View>
			<View style={styles.cardOverlay} />
		</View>
    );
};

const HomeScreen = ({ navigation }) => {
	const [favorite, setFavorite] = useState([
		{ id: 1, url: 'https://picsum.photos/200/300', name: 'Campus do Vale', description: 'Endereço...', latitude: -30.035042740503524, longitude: -51.21054466813803, radius: 1000000000, enabled: true },
	]);  

	const [historical, setHistorical] = useState([
		{ id: 2, name: 'Mercearia', description: 'Endereço...', latitude: 0, longitude: 0, radius: 20, createdAt: new Date() },
	]);

	let [currId, setCurrId] = useState(favorite.length + historical.length + 1);

	const [expoPushToken, setExpoPushToken] = useState('');
	const [notification, setNotification] = useState(false);

	const notificationListener = useRef();
	const responseListener = useRef();

	const route = useRoute();
    const newAlarm = route.params?.newAlarm;
	let regionsEnabled = [];
	let regions = [];
	
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
	const toggleAlarm = (id) => {
		setFavorite((prevState) =>
			prevState.map((item) =>
				item.id === id ? { ...item, enabled: !item.enabled } : item
			)
		);
		
		favorite.forEach(fav => {
			if (fav.enabled && fav.id === id) {
				regionsTask = regionsTask.splice(regionsTask.indexOf(fav.name),1)
			}
		});

	};

	useEffect(() => {

		const startGeofence = async () => {

			const started = await Location.hasStartedGeofencingAsync("LOCATION_GEOFENCE")
			if (started){
				const stopped = await Location.stopGeofencingAsync("LOCATION_GEOFENCE")
			} 
			Location.startGeofencingAsync("LOCATION_GEOFENCE", regions)
		  };

		favorite.forEach(fav => {
			if (fav.enabled) {
				regionsEnabled.push({identifier: fav.name, latitude:fav.latitude, longitude:fav.longitude, radius:fav.radius})
			}
		});
		// Verifica todas regiões enabled
		if (regionsEnabled !== regions){
			regions = regionsEnabled
			regionsEnabled = []
			if (regions.length !== 0) {
				startGeofence()
			} else {
				TaskManager.unregisterAllTasksAsync()
			}
		}
    }, [favorite]);

	// Push Notification
	useEffect(() => {
		registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
	
		notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
		  setNotification(notification);
		});
	
		responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
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
			setExpoPushToken(token);
			await Location.requestForegroundPermissionsAsync();
			const backgroundPermission = await Location.requestBackgroundPermissionsAsync()
				if (backgroundPermission.granted) {
					backgroundSubscrition = Location.startLocationUpdatesAsync(
						"LOCATION_GEOFENCE", {
							accuracy: Location.Accuracy.BestForNavigation,
							distanceInterval: 1, // minimum change (in meters) betweens updates
							deferredUpdatesInterval: 10 // minimum interval (in milliseconds) between updates
						})
					}
					const started = await Location.hasStartedGeofencingAsync("LOCATION_GEOFENCE")
					const isRegisteredconst = await TaskManager.isTaskRegisteredAsync(
						"LOCATION_GEOFENCE"
					  );
					
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
			<View style={{ flex: 1, flexDirection: 'row' }}>
				<Card
					imageUrl={item.url}
					title={item.name}
					description={item.description}
					enabled={item.enabled}
					onToggle={() => toggleAlarm(item.id)}/>
			</View>
		);
	};
	  
	const showItemHistorical = ({ item }) => {
		return (
			<View style={{ ...styles.listItem }}>
				<View style={{ flex: 1 }}>
					<Text style={styles.alarmName}>{item.name}</Text>
					<Text style={styles.alarmDescription}>Criado em {item.createdAt.toLocaleDateString()} às {item.createdAt.toLocaleTimeString()}</Text>
				</View>
				<TouchableOpacity>
					<FontAwesome5 name="star" onPress={() => historicalToFavorite({ item })} size={25} color="#FFD700"/>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={['#ffffff', '#f0f0f0']} start={[0, 0]} end={[0, 1]} style={styles.header}>
				<Text style={{ fontSize: 24, color: 'black' }}>LocAlarm</Text>
				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity onPress={() => navigation.navigate('NewAlarm')}>
						<FontAwesome5 name="plus" size={25} style={{ color: 'black', marginLeft: 25 }}/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate('Settings')}>
						<FontAwesome5 name="cog" size={25} style={{ color: 'black', marginLeft: 25 }}/>
					</TouchableOpacity>
				</View>
			</LinearGradient>

			<View style={{ flex: 1 }}>
				<View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
					<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Favoritos</Text>
				</View>
				<FlatList style={{ paddingHorizontal: 15, height: 120 }} data={favorite} keyExtractor={(item) => item.id.toString()} renderItem={showItemFavorite} numColumns={2}/>

				<View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
					<Text style={{ fontSize: 18, fontWeight: 'bold'}}>Histórico</Text>
				</View>
				<FlatList style={{ paddingHorizontal: 15, flex: 1 }} data={historical} renderItem={showItemHistorical}/>
			</View>
		</View>
	);
}

const Stack = createStackNavigator();

function App() {
	return (
		<View style={{ flex: 1, marginTop: StatusBar.currentHeight+20, backgroundColor: '#ffffff' }}>
			<StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
			<NavigationContainer>
				<Stack.Navigator screenOptions={{ headerShown: false }}>
					<Stack.Screen name="Alarms" component={HomeScreen}/>
					<Stack.Screen name="NewAlarm" component={NewAlarmScreen}/>
					<Stack.Screen name="Settings" component={SettingsScreen}/>
				</Stack.Navigator>
			</NavigationContainer>
		</View>
	);
}

export default App;