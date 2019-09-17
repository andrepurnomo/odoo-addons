import React from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  Text,
  ActivityIndicator,
  Platform,
  BackHandler,
  Dimensions,
  Keyboard,
  ToastAndroid,
  PermissionsAndroid,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {WebView} from 'react-native-webview';
import PushNotification from 'react-native-push-notification';

export default class App extends React.Component {
  // INITIAL STATE
  constructor(props) {
    super(props);
    this.state = {
      visibleHeight: Dimensions.get('window').height,
      isAllow: false,
      info: '',
      refreshing: false,
      animating: true,
      id: null,
    };
  }

  // VARIABLE FOR WEBVIEW
  webView = {
    canGoBack: false,
    ref: null,
  };

  async componentDidMount() {
    // REQUEST PHONE STATE
    // IF YOU DON'T WANT TO
    // VERIFY YOUR DEVICE, COMMAND 2 LINE IN THIS
    // AND CHANGE STATE ISALLOW TO TRUE
    await this.requestPhoneState();
    this.getUniqueIds();

    // ONLY RUN IN ANDROID
    if (Platform.OS === 'android') {
      BackHandler.addEventListener(
        'hardwareBackPress',
        this.onAndroidBackPress,
      );
      Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
      Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
    }
  }

  // WHEN UNMOUNT, REMOVE EVENT LISTENER
  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress');
    }
  }

  // FUNCTION TO GOBACK IN WEBVIEW
  onAndroidBackPress = () => {
    if (this.webView.canGoBack && this.webView.ref) {
      this.webView.ref.goBack();
      return true;
    }
    return false;
  };

  // TO RESIZE WEBVIEW IF KEYBOARD IS SHOW
  keyboardDidShow(e) {
    let newSize = Dimensions.get('window').height - e.endCoordinates.height;
    this.setState({visibleHeight: newSize});
  }

  // TO RESIZE WEBVIEW IF KEYBOARD IS HIDE
  keyboardDidHide(e) {
    this.setState({visibleHeight: Dimensions.get('window').height});
  }

  // GET UNIQUE IDS
  // AND THEN VERIFY DEVICE UNIQUE ID
  getUniqueIds() {
    this.setState({info: 'Verifikasi Device', animating: true});
    fetch('http://your_odoo_url.com/mail_mobile/get_devices')
      .then(response => response.json())
      .then(data => this.checkId(data))
      .catch(error => console.log(error));
  }

  // FUNCTION TO CHECK ID
  checkId(ids) {
    id = DeviceInfo.getUniqueID();
    this.setState({id: 'err : ' + id});
    if (ids['devices'].find(x => x == id)) {
      this.setState({isAllow: true});
      ToastAndroid.show('Device berhasil verifikasi', ToastAndroid.LONG);
    } else {
      ToastAndroid.show('Device tidak dikenali', ToastAndroid.LONG);
      this.setState({
        info:
          'Aplikasi tidak dapat mengenali device, silahkan hubungi bagian IT.',
        animating: false,
      });
    }
  }

  // FUNCTION TO SEND NOTIF
  sendNotif(json) {
    data = JSON.parse(json);
    message = data.body.replace(/<[^>]*>/g, '');

    PushNotification.localNotification({
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_launcher',
      bigText: message,
      vibrate: true,
      vibration: 300,
      title: 'Pesan dari ' + data.author_id[1],
      message: message.substr(0, 40) + '...',
      playSound: true,
      soundName: 'default',
    });
  }

  // RELOAD WHEN VERIFY IS FAILED
  reload() {
    if (this.state.isAllow == true) this.webView.ref.reload();
    else this.getUniqueIds();
  }

  // REQUEST PHONE STATE
  // TO GET PERMISSION
  async requestPhoneState() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: 'Produksi',
          message: 'Aplikasi memerlukan akses ke device.',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show('Akses ditolak.', ToastAndroid.LONG);
      } else {
        ToastAndroid.show('Akses diberikan.', ToastAndroid.LONG);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  // GO RENDER
  render() {
    // INJECT TO ODOO CONTEXT
    const injectedJS = 'this.odoo.in_app = true';

    return (
      <ScrollView
        contentContainerStyle={{flex: 1}}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.reload.bind(this)}
            enabled={!this.state.isAllow}
          />
        }
        style={{height: this.state.visibleHeight}}>
        {!this.state.isAllow && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 20,
            }}>
            <ActivityIndicator
              animating={this.state.animating}
              size="small"
              color="#0000ff"
            />
            <Text style={{textAlign: 'center'}}>{this.state.info}</Text>
            <Text>{this.state.id}</Text>
          </View>
        )}
        {this.state.isAllow && (
          <WebView
            source={{uri: 'http://your_odoo_url'}}
            ref={webView => {
              this.webView.ref = webView;
            }}
            onNavigationStateChange={navState => {
              this.webView.canGoBack = navState.canGoBack;
            }}
            incognito={true}
            onMessage={event => {
              this.sendNotif(event.nativeEvent.data);
            }}
            injectedJavaScript={injectedJS}
          />
        )}
      </ScrollView>
    );
  }
}
