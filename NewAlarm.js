import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';

const activationRadiusOptions = [10, 50, 100, 200, 500, 1000];

const RadiusSelector = ({ activationRadius, onRadiusChange }) => {
    const [currentIndex, setCurrentIndex] = useState(
        activationRadiusOptions.indexOf(activationRadius)
    );

    const minusButton = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            onRadiusChange(activationRadiusOptions[currentIndex - 1]);
        }
    };

    const plusButton = () => {
        if (currentIndex < activationRadiusOptions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            onRadiusChange(activationRadiusOptions[currentIndex + 1]);
        }
    };

    return (
        <View style={styles.radius}>
            <TouchableOpacity onPress={minusButton}>
                <Text style={{ fontSize: 20, color: 'black', marginHorizontal: 10 }}> - </Text>
            </TouchableOpacity>
            
            <Text style={{ fontSize: 15, flex: 1, textAlign: 'center', paddingVertical: 5 }}> {activationRadiusOptions[currentIndex]} metros </Text>
            
            <TouchableOpacity onPress={plusButton}>
                <Text style={{ fontSize: 20, color: 'black', marginHorizontal: 10 }}> + </Text>
            </TouchableOpacity>
        </View>
    );
};

function NewAlarmScreen() {
    const navigation = useNavigation();
    const [tag, setTag] = useState('');
    const [location, setLocation] = useState('');
    const [region, setRegion] = useState(null);
    const [activationRadius, setActivationRadius] = useState(50);

    const submitButton = () => {
        console.log(`Etiqueta: ${tag} | Localização: ${location} | Latitude/Longitude: ${region?.latitude ?? 0}/${region?.longitude ?? 0} | Raio de ativação: ${activationRadius}`);
        
        const newAlarm = {name: tag, description: location, createdAt: new Date(Date.now()).toISOString()};
        navigation.navigate('Alarms', { newAlarm });
    };

    const getMapPosition = (event) => {
        const { coordinate } = event.nativeEvent;
        setRegion(coordinate);
        setLocation(`${event.nativeEvent.coordinate.latitude}, ${event.nativeEvent.coordinate.longitude}`);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 0.45 }}>
                <MapView style={{ flex: 1 }} region={region} onPress={getMapPosition}>
                    {region && <Marker coordinate={region}/>}
                </MapView>
            </View>

            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Nome do Alarme</Text>
                    <TextInput style={{ ...styles.listItem, marginTop: 10, height: 60 }} onChangeText={(text) => setTag(text)} value={tag} placeholder='Adicione um nome ou etiqueta'/>
                </View>
                
                <View style={{ backgroundColor: '#f0f0f0', padding: 15, marginTop: -20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Localização</Text>
                    <TextInput style={{ ...styles.listItem, marginTop: 10, height: 60 }} onChangeText={(text) => setLocation(text)} value={location} placeholder='Selecione um local no mapa'/>
                </View>
                
                <View style={{ backgroundColor: '#f0f0f0', padding: 15, marginTop: -20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Raio de Ativação</Text>
                    
                    <View style={{ ...styles.listItem, ...styles.radiusView, justifyContent: 'center', alignItems: 'center', height: 60 }}>
                        <RadiusSelector	activationRadius={activationRadius} onRadiusChange={setActivationRadius}/>
                    </View>                    
                </View>
                
                <View style={{ backgroundColor: '#f0f0f0', padding: 15, marginTop: -20, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={submitButton}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginRight: 10 }}>Concluído</Text>
                        <FontAwesome name="check" size={22} style={{ color: 'black' }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default NewAlarmScreen;