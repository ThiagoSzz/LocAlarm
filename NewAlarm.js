import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
    const [tag, setTag] = useState('');
    const [location, setLocation] = useState('');
    const [region, setRegion] = useState(null);
    const [activationRadius, setActivationRadius] = useState(50);

    const submitButton = () => {
        console.log(`Etiqueta: ${tag} | Localização: ${location} | Latitude/Longitude: ${region?.latitude ?? 0}/${region?.longitude ?? 0} | Raio de ativação: ${activationRadius}`);
    };

    const getMapPosition = (event) => {
        const { coordinate } = event.nativeEvent;
        setRegion(coordinate);
        setLocation(`${event.nativeEvent.coordinate.latitude}, ${event.nativeEvent.coordinate.longitude}`);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <MapView style={{ flex: 1 }} region={region} onPress={getMapPosition}>
                    {region && <Marker coordinate={region}/>}
                </MapView>
            </View>

            <View style={{ flex: 1 }}>
                <TextInput style={styles.textInput} onChangeText={(text) => setTag(text)} value={tag} placeholder='Etiqueta'/>
                
                <TextInput style={styles.textInput} onChangeText={(text) => setLocation(text)} value={location} placeholder='Localização'/>
                
                <View style={styles.radiusView}>
                    <Text>Raio de Ativação</Text>
                    <RadiusSelector	activationRadius={activationRadius} onRadiusChange={setActivationRadius}/>
                </View>
                
                <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 60 }}>
                    <Button title='Concluído' onPress={submitButton}/>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 20,
        paddingLeft: 15,
    },
    radiusView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 15,
        marginTop: 10,
    },
    radius: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 30,
        padding: 5,
        marginLeft: 10,
        marginRight: 10,
        width: 200,
    },
});

export default NewAlarmScreen;