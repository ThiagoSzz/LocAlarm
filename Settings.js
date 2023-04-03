import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ModalDropdown from 'react-native-modal-dropdown';
import styles from './Styles';

function SettingsScreen() {
    const [showDropDown, setShowDropDown] = useState(false);
    const [selectedRingtone, setSelectedRingtone] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const navigation = useNavigation();

    const [buttonStates, setButtonStates] = useState({
        pushNotifications: true,
        silentMode: true,
        darkMode: false,
    });

    const handlePushNotifications = () => {
        setButtonStates({ ...buttonStates, pushNotifications: !buttonStates.pushNotifications });
    };
      
    const handleSilentMode = () => {
        setButtonStates({ ...buttonStates, silentMode: !buttonStates.silentMode });
    };
    
    const handleDarkMode = () => {
        setButtonStates({ ...buttonStates, darkMode: !buttonStates.darkMode });
    };

    const soundOptions = [
        'Classic Phone', 'Digital Ringtone', 
        'Funky Ringtone' ,'Marimba', 
        'Retro Ringtone', 'Simple Ringtone', 
        'Smooth Ringtone', 'Synth Ringtone', 
        'Upbeat Ringtone', 'Whistle'
    ];

    const languageOptions = [
        "🇧🇷 PT-BR",
        "🇺🇸 EN",
        "🇪🇸 ES",
        "🇫🇷 FR",
        "🇩🇪 DE",
    ];

    return (
        <View style={{ flex: 1 }}>
            <View style={{ ...styles.header, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.navigate('Alarms')}>
                    <FontAwesome5 name="angle-left" size={30} style={{ color: 'black' }}/>
                </TouchableOpacity>

                <Text style={{ flex: 1, fontSize: 24, color: 'black', textAlign: 'center' }}>Configurações</Text>
            </View>

            <View style={{ padding: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Notificação</Text>
                <View style={{ ...styles.commonSection }}>
                    <View style={{ ...styles.configItem, marginBottom: 10 }}>
                        <Text style={{ fontSize: 16 }}>Notificações push</Text>
                        <TouchableOpacity onPress={() => handlePushNotifications()}>
                            <FontAwesome5 name={buttonStates.pushNotifications ? "toggle-on" : "toggle-off"} size={40} color={buttonStates.pushNotifications ? "#4CD964" : "#C7C7CC"} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ ...styles.configItem }}>
                        <Text style={{ fontSize: 16 }}>Modo silencioso</Text>
                        <TouchableOpacity onPress={() => handleSilentMode()}>
                            <FontAwesome5 name={buttonStates.silentMode ? "toggle-on" : "toggle-off"} size={40} color={buttonStates.silentMode ? "#4CD964" : "#C7C7CC"} />
                        </TouchableOpacity>
                    </View>
                    {!buttonStates.silentMode &&
                    <View style={{ ...styles.configItem, marginTop: 18 }}>
                        <Text style={{ fontSize: 16 }}>Selecione um toque</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ModalDropdown options={soundOptions} defaultValue={soundOptions[0]} textStyle={{ fontSize: 16 }} dropdownTextStyle={{ width: 100, fontSize: 11, textAlign: 'center' }} onSelect={(index, value) => {setSelectedRingtone(value);}}>
                            </ModalDropdown>
                            <TouchableOpacity style={{ marginLeft: 8 }}>
                                <FontAwesome5 name="play-circle" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    }
                </View>

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>Geral</Text>
                <View style={{ ...styles.commonSection }}>
                    <View style={{ ...styles.configItem, marginBottom: 10 }}>
                        <Text style={{ fontSize: 16 }}>Modo escuro</Text>
                        <TouchableOpacity onPress={() => handleDarkMode()}>
                            <FontAwesome5 name={buttonStates.darkMode ? "toggle-on" : "toggle-off"} size={40} color={buttonStates.darkMode ? "#4CD964" : "#C7C7CC"} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ ...styles.configItem, marginTop: 18 }}>
                        <Text style={{ fontSize: 16 }}>Selecione um idioma</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ModalDropdown options={languageOptions} defaultValue={languageOptions[0]} textStyle={{ fontSize: 16 }} dropdownTextStyle={{ width: 70, fontSize: 11, textAlign: 'center' }} onSelect={(index, value) => {setSelectedLanguage(value);}}>
                            </ModalDropdown>
                            <TouchableOpacity style={{ marginLeft: 15, marginRight: 5 }}>
                                <FontAwesome5 name="sync-alt" size={16} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ ...styles.commonSection, marginTop: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                        Seja Premium  <FontAwesome5 name="plus" size={18} color="gold"/>
                    </Text>
                    <View style={{ ...styles.configItem, marginBottom: 10 }}>
                        <Text style={{ fontSize: 16 }}>Aproveite recursos exclusivos do aplicativo!</Text>
                    </View>
                    <View style={{ ...styles.configItem, marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, color: 'grey' }}>Adquira uma vez e obtenha benefício vitalício.</Text>
                    </View>
                    <TouchableOpacity style={{ alignSelf: 'center', backgroundColor: 'gold', borderRadius: 5, paddingVertical: 10, paddingHorizontal: 20 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>R$15.00</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

export default SettingsScreen;