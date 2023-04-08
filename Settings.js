import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ModalDropdown from 'react-native-modal-dropdown';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

import styles from './Styles';
import { darkTheme, lightTheme } from './Theme';

function SettingsScreen({ isDarkModeOn, setIsDarkModeOn }) {
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedRingtone, setSelectedRingtone] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const navigation = useNavigation();
  const route = useRoute();

  const [buttonStates, setButtonStates] = useState({
    pushNotifications: true,
    silentMode: true,
    darkMode: true,
  });

  useEffect(() => {
    if (route.params && route.params.buttonStates) {
      const states = Object.values(route.params);
      setButtonStates({
        darkMode: states[0].darkMode,
        pushNotifications: states[0].pushNotifications,
        silentMode: states[0].silentMode,
      });
    }
  }, [route.params]);

  const handlePushNotifications = () => {
    setButtonStates({
      ...buttonStates,
      pushNotifications: !buttonStates.pushNotifications,
    });
  };

  const handleSilentMode = () => {
    setButtonStates({ ...buttonStates, silentMode: !buttonStates.silentMode });
  };

  const handleDarkMode = () => {
    setButtonStates({ ...buttonStates, darkMode: !buttonStates.darkMode });
    setIsDarkModeOn(!buttonStates.darkMode);
  };

  const soundOptions = [
    'Radar',
    'Digital Ringtone',
    'Funky Ringtone',
    'Marimba',
    'Retro Ringtone',
    'Simple Ringtone',
    'Smooth Ringtone',
    'Synth Ringtone',
    'Upbeat Ringtone',
    'Whistle',
  ];

  const playSound = async () => {
    const soundObject = new Audio.Sound();

    await soundObject.loadAsync(require('./sounds/toque.mp3'));

    await soundObject.playAsync();

    setTimeout(async () => {
      await soundObject.stopAsync();

      await soundObject.unloadAsync();
    }, 13000);
  };

  const languageOptions = ['🇧🇷 PT-BR', '🇺🇸 EN', '🇪🇸 ES', '🇫🇷 FR', '🇩🇪 DE'];

  if (isDarkModeOn) {
    colors = darkTheme;
  } else {
    colors = lightTheme;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.secondaryBackground }}>
      <LinearGradient
        colors={[colors.primaryBackground, colors.secondaryBackground]}
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
            marginBottom: 8,
          }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Alarms', { buttonStates })}>
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
                  marginLeft: -55,
                }}>
                Configurações
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View
        style={{ padding: 15, backgroundColor: colors.secondaryBackground }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: -5,
            marginBottom: 10,
            color: colors.primaryTextAndIcons,
          }}>
          Notificação
        </Text>
        <View
          style={{
            ...styles.commonSection,
            backgroundColor: colors.primaryBackground,
          }}>
          <View style={{ ...styles.configItem, marginBottom: 10 }}>
            <Text style={{ fontSize: 16, color: colors.primaryTextAndIcons }}>
              Notificações push
            </Text>
            <TouchableOpacity onPress={() => handlePushNotifications()}>
              <Feather
                name={
                  buttonStates.pushNotifications
                    ? 'toggle-right'
                    : 'toggle-left'
                }
                size={40}
                color={
                  buttonStates.pushNotifications
                    ? colors.onColor
                    : colors.disabledColor
                }
              />
            </TouchableOpacity>
          </View>

          <View style={{ ...styles.configItem }}>
            <Text style={{ fontSize: 16, color: colors.primaryTextAndIcons }}>
              Modo silencioso
            </Text>
            <TouchableOpacity onPress={() => handleSilentMode()}>
              <Feather
                name={buttonStates.silentMode ? 'toggle-right' : 'toggle-left'}
                size={40}
                color={
                  buttonStates.silentMode
                    ? colors.onColor
                    : colors.disabledColor
                }
              />
            </TouchableOpacity>
          </View>
          {!buttonStates.silentMode && (
            <View style={{ ...styles.configItem, marginTop: 18 }}>
              <Text style={{ fontSize: 16, color: colors.primaryTextAndIcons }}>
                Selecione um toque
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ModalDropdown
                  options={soundOptions}
                  defaultValue={soundOptions[0]}
                  textStyle={{
                    fontSize: 16,
                    color: colors.secondaryTextAndIcons,
                  }}
                  dropdownTextStyle={{
                    width: 100,
                    fontSize: 11,
                    textAlign: 'center',
                    backgroundColor: colors.secondaryBackground,
                  }}
                  onSelect={(index, value) => {
                    setSelectedRingtone(value);
                  }}></ModalDropdown>
                <TouchableOpacity style={{ marginLeft: 8 }} onPress={playSound}>
                  <Feather
                    name="play-circle"
                    size={20}
                    color={colors.secondaryTextAndIcons}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            marginTop: 10,
            color: colors.primaryTextAndIcons,
          }}>
          Geral
        </Text>
        <View
          style={{
            ...styles.commonSection,
            backgroundColor: colors.primaryBackground,
          }}>
          <View style={{ ...styles.configItem, marginBottom: 10 }}>
            <Text style={{ fontSize: 16, color: colors.primaryTextAndIcons }}>
              Modo escuro
            </Text>
            <TouchableOpacity onPress={() => handleDarkMode()}>
              <Feather
                name={buttonStates.darkMode ? 'toggle-right' : 'toggle-left'}
                size={40}
                color={
                  buttonStates.darkMode ? colors.onColor : colors.disabledColor
                }
              />
            </TouchableOpacity>
          </View>

          <View style={{ ...styles.configItem, marginTop: 5 }}>
            <Text style={{ fontSize: 16, color: colors.primaryTextAndIcons }}>
              Selecione um idioma
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ModalDropdown
                options={languageOptions}
                defaultValue={languageOptions[0]}
                textStyle={{
                  fontSize: 16,
                  color: colors.secondaryTextAndIcons,
                }}
                dropdownTextStyle={{
                  width: 70,
                  fontSize: 11,
                  textAlign: 'center',
                  backgroundColor: colors.secondaryBackground,
                }}
                onSelect={(index, value) => {
                  setSelectedLanguage(value);
                }}></ModalDropdown>
            </View>
          </View>
        </View>

        <View
          style={{
            ...styles.commonSection,
            marginTop: 10,
            backgroundColor: colors.primaryBackground,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 10,
              color: colors.primaryTextAndIcons,
            }}>
            Seja Premium <Feather name="plus" size={20} color="gold" />
          </Text>
          <View style={{ ...styles.configItem, marginBottom: 10 }}>
            <Text style={{ fontSize: 16, color: colors.primaryTextAndIcons }}>
              Aproveite recursos exclusivos do aplicativo!
            </Text>
          </View>
          <View style={{ ...styles.configItem, marginBottom: 20 }}>
            <Text style={{ fontSize: 12, color: colors.secondaryTextAndIcons }}>
              Adquira uma vez e obtenha benefício vitalício.
            </Text>
          </View>
          <TouchableOpacity
            style={{
              alignSelf: 'center',
              backgroundColor: 'gold',
              borderRadius: 5,
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}>
            <Text
              style={{
                color: colors.primaryTextAndIcons,
                fontSize: 16,
                fontWeight: 'bold',
              }}>
              R$15.00
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default SettingsScreen;
