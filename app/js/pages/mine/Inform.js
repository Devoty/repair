import React, { Component } from 'react';
import {
    View,
    Text,
    BackAndroid,
    TouchableOpacity,
    Image,
    StyleSheet,
    InteractionManager,
    TextInput,
    ScrollView,
    Dimensions
} from 'react-native';
import RNFetchBlob from '../../../util/RNFetchBlob';
import TitleBar from '../../component/TitleBar';
import BaseComponent from '../../base/BaseComponent'
import * as Dimens from '../../value/dimens';
import AsyncStorage from '@react-native-community/async-storage';
let ScreenWidth = Dimensions
  .get('window')
  .width;
let ScreenHeight = Dimensions
  .get('window')
  .height;
export default class Inform extends BaseComponent {
    static navigationOptions = {
        header: null,
    };
    constructor(props){
        super(props);
        this.state={
            theme:this.props.theme,
            userData:null,
            workOrderNotify: [],
            unReadWorkOrderNotifyTotal: 0
        }
    }
    componentDidMount() {
        var that = this;
        this.loadDetail();
    }
    componentWillReceiveProps(nextProps) {
        this.loadDetail();
    }
    loadDetail() {
        var that = this;  
        AsyncStorage.getItem('uinfo',function (error, result) {
            if(error){
                console.log(error)
                return
            }else{
                var userInfo =  JSON.parse(result);
                that.setState({userData:userInfo});
                console.log(userInfo)
            }
        });

        AsyncStorage.getItem(global.tenant_code + global.userId, function (error, result) {
            if (error) {
                console.log('读取失败')
            } else {
                result = JSON.parse(result);
                var resultData = result || [];
                console.info(global.tenant_code+global.userId)
                console.info(resultData)
                let unRead = 0;
                if(resultData.length > 0){
                    resultData.forEach(item => {
                        if(item.recordAlreadyRead === 0){
                            unRead++;
                        }
                    });
                    that.setState({workOrderNotify:resultData});
                    that.setState({unReadWorkOrderNotifyTotal:unRead});
                }
            }
        });
    }

    lookInform(){
        const {navigation} = this.props;
        InteractionManager.runAfterInteractions(() => {
            navigation.navigate('SystemInform',{theme:this.theme})
        });
    }

    workOrderNotify(){
        const {navigation} = this.props;
        InteractionManager.runAfterInteractions(() => {
            navigation.navigate('workOrderInform',{
                theme:this.theme,
                workOrderNotify: this.state.workOrderNotify,
                callback:(()=>{

                    if(this.state.unReadWorkOrderNotifyTotal > 0){
                        let workOrderNotify = this.state.workOrderNotify;
                        workOrderNotify.find(item => {
                            if(item.recordAlreadyRead === 0){
                                item.recordAlreadyRead = 1;
                            }
                        });
                        this.setState({unReadWorkOrderNotifyTotal:0});
                        AsyncStorage.setItem(global.tenant_code + global.userId,JSON.stringify(workOrderNotify),function (error) {
                            if (error) {
                                console.log('存储失败')
                                console.log(error)
                            }else {
                                console.log('存储完成')
                            }
                        });
                    }
                })
            })
        });
    }
    
    render() {
        var userData = this.state.userData;
        if (userData) {
            var headerImg = userData.headImgId;
            var workNumber = userData.workNumber;
            var  deptName = userData.deptAddresses[0].deptName
            var userName = userData.userName;
            var gender = userData.gender;
            var telNo = userData.telNo;
        }
        
        return (
          <View style={styles.container}>
            <TitleBar
            centerText={'通知'}
            isShowLeftBackIcon={true}
            navigation={this.props.navigation}
            leftPress={() => this.naviGoBack(this.props.navigation)}
            />
 
            <View style={styles.input_center_bg}>
               
                <Text style={{color:'#404040',fontSize:15}}>系统通知</Text>  
                <TouchableOpacity onPress={()=>{this.lookInform()}}>
                <View style={{flexDirection:'row'}}>
                    <Text style={styles.ball}>1</Text>
                    <Image style={{width:9,height:15,marginLeft:5}} source={require('../../../res/login/ic_arrow.png')}/>
                </View>
                </TouchableOpacity>  
            </View>
                
            <View style={styles.input_center_bg}>
                <Text style={{color:'#404040',fontSize:15}}>预警通知</Text>
                <View style={{flexDirection:'row'}}>
                    <Text style={styles.ball}></Text>
                    <Image style={{width:9,height:15,marginLeft:5}} source={require('../../../res/login/ic_arrow.png')}/>
                </View>
               
            </View>
            <TouchableOpacity onPress={()=>{this.workOrderNotify()}}>
                <View style={styles.input_center_bg}>
                    <Text style={{color:'#404040',fontSize:15}}>工单提醒</Text>
                        <View style={{flexDirection:'row'}}>
                            {this.state.unReadWorkOrderNotifyTotal > 0 ? <Text style={styles.ball}>{this.state.unReadWorkOrderNotifyTotal}</Text> : null}
                            <Image style={{width:9,height:15,marginLeft:5}} source={require('../../../res/login/ic_arrow.png')}/>
                        </View>
                </View>
            </TouchableOpacity>
        </View>
        )
    }

}
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    ball:{
        // width:15,
        height:15,
        minWidth:15,
        padding: 1,
        borderRadius: 50,
        lineHeight:15,
        backgroundColor:'red',
        color:'white',
        textAlign:'center',
        fontWeight: '800',
    },
    input_center_bg:{
        overflow:'hidden',
        backgroundColor: '#fff',
        paddingTop: 25,
        paddingBottom: 25,
        paddingLeft: 25,
        paddingRight: 25,
        borderColor: '#d0d0d0',
        borderBottomWidth:  1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input_item:{
        flexDirection:'row',height:40,alignItems:'center',marginTop:0,
    },
    input_style:{
        fontSize: 15,height:40,textAlign: 'left',textAlignVertical:'center',flex:1,marginLeft:0
    },
    line:{
        backgroundColor:'#eeeeee',height:1,width:(Dimens.screen_width-20),marginTop:0,
    },
})