import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

import styles from './Styles';
import {lightTheme, darkTheme} from './Theme';

const RadiusSelector = ({ activationRadius, onRadiusChange }) => {
  const activationRadiusOptions = [10, 50, 100, 200, 500, 1000];
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
        <Text
          style={{
            fontSize: 30,
            color: colors.primaryTextAndIcons,
            marginHorizontal: 10,
          }}>
          {' '}
          -{' '}
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 15,
          flex: 1,
          textAlign: 'center',
          paddingVertical: 5,
          color: colors.primaryTextAndIcons,
        }}>
        {' '}
        {activationRadiusOptions[currentIndex]} metros{' '}
      </Text>

      <TouchableOpacity onPress={plusButton}>
        <Text
          style={{
            fontSize: 30,
            color: colors.primaryTextAndIcons,
            marginHorizontal: 10,
          }}>
          {' '}
          +{' '}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

function NewAlarmScreen({isDarkModeOn}) {
  const navigation = useNavigation();
  const mapViewRef = useRef(null);
  const [tag, setTag] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState(null);
  const [image, setImage] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [activationRadius, setActivationRadius] = useState(50);
  const [GPSlocation, setGPSLocation] = useState(null);

  if (isDarkModeOn){
      colors = darkTheme
    } else {
      colors = lightTheme
    }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setGPSLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
      });
    })();
  }, []);

  const states = {
    Acre: 'AC',
    Alagoas: 'AL',
    Amapá: 'AP',
    Amazonas: 'AM',
    Bahia: 'BA',
    Ceará: 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    Goiás: 'GO',
    Maranhão: 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    Pará: 'PA',
    Paraíba: 'PB',
    Paraná: 'PR',
    Pernambuco: 'PE',
    Piauí: 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    Rondônia: 'RO',
    Roraima: 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    Sergipe: 'SE',
    Tocantins: 'TO',
  };

  const getStateUF = (stateName) => {
    const state = Object.entries(states).find(
      ([name]) => name.toLowerCase() === stateName.toLowerCase()
    );
    return state ? state[1] : state[1];
  };

  const submitButton = async () => {
    console.log(
      `Etiqueta: ${tag} | Localização: ${location} | Latitude/Longitude: ${
        region?.latitude ?? 0
      }/${region?.longitude ?? 0} | Raio de ativação: ${activationRadius}`
    );

    var snapshot = await takeSnapshot(mapViewRef);
    const newAlarm = {
      name: tag,
      description: location,
      url: snapshot,
      longitude: region?.longitude,
      latitude: region?.latitude,
      radius: activationRadius,
      createdAt: new Date(Date.now()).toISOString(),
    };
    navigation.navigate('Alarms', { newAlarm });
  };

  const getMapPosition = (event) => {
    const { coordinate } = event.nativeEvent;
    setRegion(coordinate);

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinate.latitude}&lon=${coordinate.longitude}`
    )
      .then((response) => response.json())
      .then((data) => {
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
        } else {
          setAddressError('Erro: aproxime mais o ponto do local desejado');
        }
      })
      .catch(() => {
        setAddressError('Erro: local inválido');
      });
  };

  const updatePinPosition = (address) => {
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`
    )
      .then((response) => response.json())
      .then((data) => {
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
        styleURL: 'mapbox://styles/mapbox/navigation-day-v1',
      });

      console.log('Snapshot:', snapshot);

      return snapshot;
    } catch (error) {
      console.error('Erro ao tirar snapshot:', error);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.primaryBackground, '#f9f5ea']}
        start={[0, 0]}
        end={[0, 1]}
        style={{ ...styles.header }}>
        <View
          style={{
            backgroundColor: colors.primaryBackground,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            width: '100%',
            elevation: 5,
          }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Alarms')}>
              <Feather
                name="chevron-left"
                size={32}
                style={{ color: colors.primaryTextAndIcons, marginLeft: 25 }}
              />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: colors.primaryTextAndIcons,
                }}>
                Novo Alarme
              </Text>
            </View>

            <TouchableOpacity onPress={submitButton}>
              <Feather
                name="check"
                size={30}
                style={{ color: colors.primaryTextAndIcons, marginRight: 25 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {GPSlocation && (
        <MapView
          ref={mapViewRef}
          style={{ flex: 0.67 }}
          region={region}
          onPress={getMapPosition}
          initialRegion={GPSlocation}>
          {region && <Marker coordinate={region} />}
          {GPSlocation && (
            <Marker coordinate={GPSlocation} title="You" pinColor="green" />
          )}
          {activationRadius && region && (
            <Circle center={region} radius={activationRadius} />
          )}
        </MapView>
      )}

      <ScrollView
        style={{
          flex: 0.33,
          backgroundColor: colors.primaryBackground,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomWidth: 1,
          padding: 15,
        }}
        contentContainerStyle={{ height: '148%' }}>
        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.primaryTextAndIcons,
            }}>
            Nome do Alarme
          </Text>
          <TextInput
            style={{
              ...styles.listItem,
              marginTop: 10,
              height: 60,
              backgroundColor: colors.secondaryBackground,
              color: colors.primaryTextAndIcons,
            }}
            onChangeText={(text) => setTag(text)}
            value={tag}
            placeholder="Adicione um nome ou etiqueta"
            placeholderTextColor={colors.primaryTextAndIcons}
          />
        </View>

        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.primaryTextAndIcons,
            }}>
            Localização
          </Text>
          <TextInput
            style={{
              ...styles.listItem,
              marginTop: 10,
              height: 60,
              backgroundColor: colors.secondaryBackground,
              color: colors.primaryTextAndIcons,
            }}
            onChangeText={(text) => setLocation(text)}
            value={location}
            placeholder={addressError || 'Selecione um local no mapa'}
            placeholderTextColor={colors.primaryTextAndIcons}
            onSubmitEditing={() => updatePinPosition(location)}
          />
        </View>

        <View style={{ marginTop: 10 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.primaryTextAndIcons,
            }}>
            Raio de Ativação
          </Text>

          <View
            style={{
              ...styles.listItem,
              ...styles.radiusView,
              justifyContent: 'center',
              alignItems: 'center',
              height: 60,
              backgroundColor: colors.secondaryBackground,
            }}>
            <RadiusSelector
              activationRadius={activationRadius}
              onRadiusChange={setActivationRadius}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default NewAlarmScreen;
