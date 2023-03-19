import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useRoute } from '@react-navigation/native';

import NewAlarmScreen from './NewAlarm';
import SettingsScreen from './Settings';
import styles from './Styles';

const HomeScreen = ({ navigation }) => {
	let [currId, setCurrId] = useState(5);

	const route = useRoute();
    const newAlarm = route.params?.newAlarm;

	useEffect(() => {
        if (newAlarm) {
			var localId = incrementId();
        	setHistorical([...historical, { ...newAlarm, id: localId, createdAt: new Date(newAlarm.createdAt) }]);
        }
    }, [newAlarm]);

	const [favorite, setFavorite] = useState([
		{ id: 1, name: 'Campus do Vale', description: 'Endereço...', enabled: true },
		{ id: 2, name: 'Centro', description: 'Endereço...', enabled: false },
	]);  

	const [historical, setHistorical] = useState([
		{ id: 3, name: 'Mercearia', description: 'Endereço...', createdAt: new Date() },
		{ id: 4, name: 'Campus Saúde', description: 'Endereço...', createdAt: new Date() },
		{ id: 5, name: 'Campus Engenharia', description: 'Endereço...', createdAt: new Date() }
	]);

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