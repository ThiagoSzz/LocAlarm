import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import NewAlarmScreen from './NewAlarm';
import SettingsScreen from './Settings';

const HomeScreen = ({ navigation }) => {
	const [favorite, setFavorite] = useState([
		{
			id: 1,
			name: 'Campus do Vale',
			description: 'Endereço 1',
			enabled: true,
		},
		{
			id: 2,
			name: 'Centro',
			description: 'Endereço 2',
			enabled: false,
		},
		{
			id: 3,
			name: 'Casa',
			description: 'Endereço 3',
			enabled: true,
		},
		{
			id: 4,
			name: 'Mercado',
			description: 'Endereço 4',
			enabled: true,
		},
		{
			id: 5,
			name: 'Aeroporto',
			description: 'Endereço 5',
			enabled: true,
		},
	]);	  

	const [historical, setHistorical] = useState([
		{
			name: 'Mercearia',
			description: 'Endereço 6',
			createdAt: new Date()
		},
		{
			name: 'Campus Saúde',
			description: 'Endereço 7',
			createdAt: new Date()
		},
	]);

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
					<FontAwesome name="cog" size={30} color="#888888" style={{ marginRight: 15 }} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => toggleAlarm(item.id)}>
					{item.enabled ? (
						<FontAwesome name="toggle-on" size={40} color="#4CD964" />
					) : (
						<FontAwesome name="toggle-off" size={40} color="#C7C7CC" />
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
				<FontAwesome name="star" size={32} color="#FFD700" style={{ marginRight: 15 }} />
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
						<FontAwesome name="plus" size={25} style={{ color: 'black',	marginLeft: 25 }} />
					</TouchableOpacity>
					<TouchableOpacity onPress={() => navigation.navigate('Settings')}>
						<FontAwesome name="cog" size={25} style={{ color: 'black',	marginLeft: 25 }} />
					</TouchableOpacity>
				</View>
			</View>

			<View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
				<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Favoritos</Text>
			</View>
			<FlatList style={{ paddingHorizontal: 15, height: 250 }} data={favorite} keyExtractor={(item) => item.id.toString()} renderItem={showItemFavorite} />
			
			<View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
				<Text style={{ fontSize: 18, fontWeight: 'bold' }}>Histórico</Text>
			</View>
			<FlatList style={{ paddingHorizontal: 15 }}	data={historical}	renderItem={showItemHistorical} />
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 10,
		paddingHorizontal: 15,
	},
	listItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: 'white',
		padding: 15,
		borderRadius: 5,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.25,
		shadowRadius: 2,
		elevation: 2,
	},
	alarmName: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	alarmDescription: {
		color: '#8E8E93',
		fontStyle: 'italic',
		fontSize: 14,
		marginBottom: 5,
	},
});

const Stack = createStackNavigator();

function App() {
	return (
	  <NavigationContainer>
		<Stack.Navigator>
		  <Stack.Screen name="Alarms" component={HomeScreen} />
		  <Stack.Screen name="NewAlarm" component={NewAlarmScreen} />
		  <Stack.Screen name="Settings" component={SettingsScreen} />
		</Stack.Navigator>
	  </NavigationContainer>
	);
}

export default App;