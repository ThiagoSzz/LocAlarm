import { StyleSheet } from 'react-native';

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
});

export default styles;