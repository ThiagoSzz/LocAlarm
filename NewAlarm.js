import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';
import * as Location from 'expo-location';

const RadiusSelector = ({ activationRadius, onRadiusChange }) => {
    const activationRadiusOptions = [10, 50, 100, 200, 500, 1000];
    const [currentIndex, setCurrentIndex] = useState(activationRadiusOptions.indexOf(activationRadius));

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
    const mapViewRef = useRef(null);
    const [tag, setTag] = useState('');
    const [location, setLocation] = useState('');
    const [region, setRegion] = useState(null);
    const [image, setImage] = useState(null);
    const [addressError, setAddressError] = useState('');
    const [activationRadius, setActivationRadius] = useState(50);
    const [GPSlocation, setGPSLocation] = useState(null);


    useEffect(() => {
        (async () => {
          
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
    
          let location = await Location.getCurrentPositionAsync({});
          setGPSLocation({latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.009, longitudeDelta: 0.009});
        })();
      }, []);

    const states = {
        'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 
        'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 
        'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 
        'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 
        'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 
        'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 
        'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
    };

    const getStateUF = (stateName) => {
        const state = Object.entries(states).find(([name]) => name.toLowerCase() === stateName.toLowerCase());
        return state ? state[1] : state[1];
    };

    const submitButton = async () => {
        console.log(`Etiqueta: ${tag} | Localização: ${location} | Latitude/Longitude: ${region?.latitude ?? 0}/${region?.longitude ?? 0} | Raio de ativação: ${activationRadius}`);
        
        var snapshot = await takeSnapshot(mapViewRef);
        const newAlarm = {
            name: tag,
            description: location,
            url: snapshot,
            longitude: region?.longitude,
            latitude: region?.latitude,
            radius: activationRadius,
            createdAt: new Date(Date.now()).toISOString()
        };
        navigation.navigate('Alarms', { newAlarm });
    };

    const getMapPosition = (event) => {
        const { coordinate } = event.nativeEvent;
        setRegion(coordinate);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinate.latitude}&lon=${coordinate.longitude}`)
        .then(response => response.json())
        .then(data => {
            const { road, number, district, city, state } = data.address;
            let address = '';

            if (road) {
                address += `${road}`;
            }

            if (number) {
                address += ` ${number}`;
            }

            if (district) {
                if (address) {
                    address += `, ${district}`;
                }
            }

            if (city) {
                if (address) {
                    address += `, ${city}`;
                }
            }

            if (state) {
                if (address) {
                    address += `, ${getStateUF(state)}`;
                }
            }

            if (address) {
                setLocation(address);
            }
            else{
                setAddressError('Erro: aproxime mais o ponto do local desejado');
            }
        })
        .catch(() => {
            setAddressError('Erro: local inválido');
        });
    };

    const updatePinPosition = (address) => {
        fetch(`https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                setRegion({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
            }
        });
    };

    async function takeSnapshot(mapViewRef) {
        try {
          const snapshot = await mapViewRef.current.takeSnapshot({
            format: 'png',
            quality: 0.8,
            result: 'file',
            styleURL: 'mapbox://styles/mapbox/navigation-day-v1'
          });
        
          console.log('Snapshot:', snapshot);
      
          return snapshot;
        } catch (error) {
          console.error('Erro ao tirar snapshot:', error);
        }
      }

    return (
        <View style={{ flex: 1 }}>
			<View style={{ ...styles.header, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity style={{ position: 'absolute', left: 0, marginLeft: 15 }} onPress={() => navigation.navigate('Alarms')}>
                    <FontAwesome5 name="angle-left" size={30} style={{ color: 'black' }}/>
                </TouchableOpacity>

                <Text style={{ fontSize: 24, color: 'black', textAlign: 'center' }}>Adicionar Alarme</Text>

                <TouchableOpacity style={{ position: 'absolute', right: 0, marginRight: 15 }} onPress={submitButton}>
                    <FontAwesome5 name="check" size={24} style={{ color: 'black'}}/>
                </TouchableOpacity>
            </View>

            {GPSlocation &&
                <MapView ref={mapViewRef} style={{ flex: 0.45 }} region={region} onPress={getMapPosition} initialRegion={GPSlocation}>
                    {region && <Marker coordinate={region}/>}
                    {GPSlocation && <Marker coordinate={GPSlocation} title='You' pinColor='green' />}
                    {activationRadius && region && <Circle center={region} radius={activationRadius}/>}
                </MapView>
            }

            <ScrollView style={{ flex: 0.55 }} contentContainerStyle={{height: '148%'}}>
                <View style={{ backgroundColor: '#f0f0f0', padding: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Nome do Alarme</Text>
                    <TextInput style={{ ...styles.listItem, marginTop: 10, height: 60 }} onChangeText={(text) => setTag(text)} value={tag} placeholder="Adicione um nome ou etiqueta"/>
                </View>

                <View style={{ backgroundColor: '#f0f0f0', padding: 15, marginTop: -20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Localização</Text>
                    <TextInput style={{ ...styles.listItem, marginTop: 10, height: 60 }} onChangeText={(text) => setLocation(text)} value={location} placeholder={addressError || "Selecione um local no mapa"} onSubmitEditing={() => updatePinPosition(location)}/>
                </View>

                <View style={{ backgroundColor: '#f0f0f0', padding: 15, marginTop: -20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Raio de Ativação</Text>

                    <View style={{ ...styles.listItem, ...styles.radiusView, justifyContent: 'center', alignItems: 'center', height: 60 }}>
                        <RadiusSelector activationRadius={activationRadius} onRadiusChange={setActivationRadius}/>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default NewAlarmScreen;