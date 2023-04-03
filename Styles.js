import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
	header: {
        height: 60,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingHorizontal: 15,
        backgroundColor: 'transparent'
    },
	commonSection: {
		backgroundColor: '#ffffff',
		padding: 15,
		borderRadius: 5,
		marginBottom: 10,
	},
	listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 8
    },
	alarmName: {
		fontSize: 14,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	alarmDescription: {
		color: '#8E8E93',
		fontStyle: 'italic',
		fontSize: 12,
		marginBottom: 5,
	},
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
        marginTop: 10,
    },
    radius: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 30,
        marginLeft: 10,
        marginRight: 10,
    },
	configItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	card: {
        width: '95%',
        borderRadius: 8,
        backgroundColor: 'white',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
        maxWidth: Dimensions.get('window').width*0.43,
    }, 
    cardImage: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
        width: '100%',
        height: 75,
    },
    cardContent: {
        padding: 12,
        height: 60,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginTop: 5
    },
    submitButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        marginTop: -10,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    circle: {
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
        padding: 3,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    daysOfWeek: {
        flexDirection: 'row',
    },
    dayOfWeek: {
        width: 14,
        height: 14,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2
    },
    dayOfWeekText: {
        color: '#000000',
        fontSize: 10,
    },
    daySelected: {
        backgroundColor: '#b8e986'
    },
    dayNotSelected: {
        backgroundColor: '#ff9393'
    }
});

export default styles;