import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StatusBar, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

import { GeofencingEventType } from 'expo-location';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import NewAlarmScreen from './NewAlarm';
import SettingsScreen from './Settings';
import styles from './Styles';
import colors from './Theme';

let silentMode = true
let pushNotifications = true

const playSound = async () => {
  if (!silentMode){
		const soundObject = new Audio.Sound();

		await soundObject.loadAsync(require('./sounds/toque.mp3'));

		await soundObject.playAsync();

		setTimeout(async () => {
			await soundObject.stopAsync();
			
			await soundObject.unloadAsync();
		}, 13000);
  }
	};

const sendNotification = async (region) => {
  if(pushNotifications){
    await Notifications.scheduleNotificationAsync({
		content: {
			title: 'You reached ' + region.identifier,
			body: 'You reached your destination'
		},
		trigger: { seconds: 1 },
	});
  }
}

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
    console.log(region)
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
    
    playSound();
    
	  regionsTask.push(region.identifier)
    sendNotification(region)
    
	}
});

const Card = ({ imageUrl, title, description, enabled, onToggle }) => {
    const [toggle, setToggle] = useState(enabled);
	const selectedDays = ['Dom','Seg','Qui','Sex'];

    const toggleHandler = () => {
        setToggle(!enabled);
        onToggle();
    };

	const removeAlarm = () => {
		onRemove();
	};

    return (
        <View style={{ ...styles.card, backgroundColor: colors.primaryBackground }}>
			<Image source={{ uri: imageUrl }} style={styles.cardImage}/>
			<View style={styles.cardContent}>
				<Text style={{ ...styles.cardTitle, color: colors.primaryTextAndIcons}} numberOfLines={1}>{title.length >= 15 ? `${title.slice(0, 15)}...` : title}</Text>
				<View style={{ ...styles.circle, backgroundColor: colors.secondaryBackground }}>
					<View style={styles.daysOfWeek}>
						<View style={{ ...styles.dayOfWeek, backgroundColor: selectedDays.includes('Dom') ? colors.onColor : colors.offColor }}>
							<Text style={styles.dayOfWeekText}>D</Text>
						</View>
						<View style={{ ...styles.dayOfWeek, backgroundColor: selectedDays.includes('Seg') ? colors.onColor : colors.offColor }}>
							<Text style={styles.dayOfWeekText}>S</Text>
						</View>
						<View style={{ ...styles.dayOfWeek, backgroundColor: selectedDays.includes('Ter') ? colors.onColor : colors.offColor }}>
							<Text style={styles.dayOfWeekText}>T</Text>
						</View>
						<View style={{ ...styles.dayOfWeek, backgroundColor: selectedDays.includes('Qua') ? colors.onColor : colors.offColor }}>
							<Text style={styles.dayOfWeekText}>Q</Text>
						</View>
						<View style={{ ...styles.dayOfWeek, backgroundColor: selectedDays.includes('Qui') ? colors.onColor : colors.offColor }}>
							<Text style={styles.dayOfWeekText}>Q</Text>
						</View>
						<View style={{ ...styles.dayOfWeek, backgroundColor: selectedDays.includes('Sex') ? colors.onColor : colors.offColor }}>
							<Text style={styles.dayOfWeekText}>S</Text>
						</View>
						<View style={{ ...styles.dayOfWeek, backgroundColor: selectedDays.includes('Sab') ? colors.onColor : colors.offColor }}>
							<Text style={styles.dayOfWeekText}>S</Text>
						</View>
					</View>
				</View>
			</View>
			<View style={styles.cardActions}>
				<TouchableOpacity activeOpacity={0.7} style={{ backgroundColor: 'transparent' }} onPress={removeAlarm}>
					<Feather name="trash-2" size={28} color='#b51717'/>
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleHandler} activeOpacity={0.7} style={{ backgroundColor: 'transparent' }}>
					<Feather name={toggle ? 'toggle-right' : 'toggle-left'} size={35} color={toggle ? colors.onColor : colors.offColor}/>
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
	]);

	let [currId, setCurrId] = useState(favorite.length + historical.length + 1);

	const [expoPushToken, setExpoPushToken] = useState('');
	const [notification, setNotification] = useState(false);
	const notificationListener = useRef();
	const responseListener = useRef();
	let regions = [];
	let regionsEnabled = [];

	const route = useRoute();
  const newAlarm = route.params?.newAlarm;
  const buttonStates = route.params;

	let darkMode;

	useEffect(() => {
      if (route.params && route.params.buttonStates) {
			const states = Object.values(route.params);
			
			pushNotifications = states[0].pushNotifications;
			darkMode = states[0].darkMode;
			silentMode = states[0].silentMode;
      console.log(route.params.buttonStates)
        }
    }, [route.params]);

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

	// Caso ocorra toggle alarm dar update em geofence
    const toggledAlarm = favorite.filter((alarm) => alarm.id === id);
    if(toggledAlarm[0].enabled){
       regionsTask = regionsTask.filter((alarm) => {
         toggledAlarm[0].name !== alarm;
       });
    }
	
	}



	const deleteAlarm = (id) => {
		const newFavoriteList = favorite.filter((alarm) => alarm.id !== id);
		setFavorite(newFavoriteList);
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
	}

	const historicalToFavorite = ({ item }) => {
		const index = historical.indexOf(item);
		const removed = historical.splice(index, 1)[0];

		const localId = incrementId();
		setFavorite([...favorite, { ...removed, id: localId, enabled: true }]);
	};

	const showItemFavorite = ({ item }) => {
		return (
		  	<View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.secondaryBackground }}>
				<Card
					imageUrl={item.url}
					title={item.name}
					description={item.description}
					enabled={item.enabled}
					onToggle={() => toggleAlarm(item.id)}
					onRemove={() => deleteAlarm(item.id)}/>
		  	</View>
		);
	};
	  
	const showItemHistorical = ({ item }) => {
		return (
			<View style={{ ...styles.listItem, backgroundColor: colors.secondaryBackground }}>
				<View style={{ flex: 1 }}>
					<Text style={{ ...styles.alarmName, color: colors.primaryTextAndIcons}}>{item.name}</Text>
					<Text style={{ ...styles.alarmDescription, color: colors.primaryTextAndIcons }}>Criado em {item.createdAt.toLocaleDateString()} às {item.createdAt.toLocaleTimeString()}</Text>
				</View>
				<TouchableOpacity>
					<Feather name="star" onPress={() => historicalToFavorite({ item })} size={25} color={colors.star}/>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<LinearGradient colors={[colors.primaryBackground, colors.secondaryBackground]} start={[0, 0]} end={[0, 1]} style={styles.header}>
				<View style={{ backgroundColor: colors.primaryBackground, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, width: '100%', elevation: 5 }}>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
						<TouchableOpacity onPress={() => navigation.navigate('Settings', buttonStates)}>
							<Feather name="settings" size={23} style={{ color: colors.primaryTextAndIcons, marginLeft: 25 }} />
						</TouchableOpacity>
						
						<View style={{ flex: 1, alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.primaryTextAndIcons }}>Alarmes</Text>
						</View>

						<TouchableOpacity onPress={() => navigation.navigate('NewAlarm')}>
							<Feather name="plus" size={30} style={{ color: colors.primaryTextAndIcons, marginRight: 25 }} />
						</TouchableOpacity>
					</View>
				</View>
			</LinearGradient>

			<View style={{ flex: 1, backgroundColor: colors.secondaryBackground }}>
				<View style={{ backgroundColor: colors.secondaryBackground, padding: 15 }}>
					<Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primaryTextAndIcons }}>Favoritos</Text>
				</View>
				{favorite.length === 0 ?
					(
					<View style={{ flex: 1, marginTop: -15, padding: 15, alignItems: 'center', width: '80%', marginLeft: -13, minHeight: 270 }}>
						<Text style={{ fontSize: 16, color: colors.primaryTextAndIcons, marginTop: -5 }}>Destaque um alarme clicando no ícone "star" 😀</Text>
					</View>
					)
					:
					(<FlatList style={{ paddingHorizontal: 15, height: 300, minHeight: 260 }} data={favorite} keyExtractor={(item) => item.id.toString()} renderItem={showItemFavorite} numColumns={2}/>)
				}

				<View style={{ backgroundColor: colors.primaryBackground, padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: '100%', elevation: 5 }}>
					<Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primaryTextAndIcons, marginTop: 8}}>Histórico</Text>
				</View>
				{historical.length === 0 ?
					(
					<View style={{ flex: 1, alignItems: 'center', marginLeft: -25, backgroundColor: colors.primaryBackground, minHeight: 160 }}>
						<Text style={{ fontSize: 16, color: colors.primaryTextAndIcons, width: '80%' }}>Adicione um novo alarme clicando no ícone "+" ao topo da tela 😉</Text>
					</View>
					)
					:
					(<FlatList style={{ paddingHorizontal: 15, width: '100%', elevation: 3, backgroundColor: colors.primaryBackground, minHeight: 160 }} data={historical} renderItem={showItemHistorical}/>)
				}
			</View>
		</View>
	);
}

const Stack = createStackNavigator();

function App() {
	return (
		<View style={{ flex: 1, backgroundColor: colors.primaryBackground, paddingTop: StatusBar.currentHeight+20 }}>
			<StatusBar barStyle={colors.statusBar} />
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