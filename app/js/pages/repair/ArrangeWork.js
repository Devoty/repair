

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    DeviceEventEmitter,
    InteractionManager,
    Modal,
    ListView,
    TouchableOpacity,
    Linking
} from 'react-native';

import TitleBar from '../../component/TitleBar';
import * as Dimens from '../../value/dimens';
import Request, {GetRepairList, RepairDetail, GetDeptListByType, GetUserListByDeptId, DispatchWork,GetUserAtWorkByDeptId} from '../../http/Request';
import { toastShort } from '../../util/ToastUtil';
import BaseComponent from '../../base/BaseComponent'

export default class ArrangeWork extends BaseComponent {
    static navigationOptions = {
        header: null,
    };
  constructor(props){
    super(props);
      const { navigation } = this.props;
      const thisRepairId = navigation.getParam('repairId', '');
    this.state={
            dataMap:new Map(),
            deptId:null,
            detaiData:null,
            modelTitle:'',
            selectDeptState:false,
            modalVisible:false,
            selectDeptPos:-1,
            selectUserPos:-1,
            selectDeptData:null,
            selectUserData:null,
            selectDeptName:null,
            selectUserName:null,
            repairId:thisRepairId,
            deptList:[],
            userList:[],
            userAtWorkList:[],
            userAtWorkListMap:new Map(),
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2)=> {
            if (r1 !== r2) {
                //console.log("不相等=");
                //console.log(r1);
            } else {
                console.log("相等=");
                //console.log(r1);
                //console.log(r2);
            }
            return true//r1.isSelected !== r2.isSelected;
        }
      }),
    }
  }

  componentDidMount() {
      this.loadDetail();
      this.getDeptListByType();

  }

  getDeptListByType() {
    var that = this;
    Request.requestGet(GetDeptListByType, null, (result)=> {
        if (result && result.code === 200) {
            that.setState({deptList:result.data});
        } else {

        }
    });
  }

  getUserListByDeptId() {
    var that = this;
    if (this.state.dataMap.has(this.deptId)) {
        var list = this.state.dataMap.get(this.state.deptId);
        that.setState({userList:list, });
        return;
    }

    Request.requestGet(GetUserListByDeptId+this.state.deptId, null, (result)=> {
        if (result && result.code === 200) {
            that.state.dataMap.set(that.state.deptId, result.data);
            that.setState({userList:result.data});
        } else {

        }
    });
  }

  getUserAtWorkListByDeptId(){
    var that = this;
    if (this.state.userAtWorkListMap.has(this.deptId)) {
        var list = this.state.userAtWorkListMap.get(this.state.deptId);
        that.setState({userList:list, });
        return;
    }

    Request.requestGet(GetUserAtWorkByDeptId+this.state.deptId, null, (result)=> {
        if (result && result.code === 200) {
            that.state.userAtWorkListMap.set(this.state.deptId, result.data);
            that.setState({userAtWorkList:result.data});
            that.userListSortByAtWorkUser(this.state.deptId,this.state.userList,result.data);
        }
    });
  }

  //在线员工展示到员工列表上层
  userListSortByAtWorkUser(deptId,userList,userAtWorkList){
    var t = [];
     for (var m = 0; m < userList.length; m++) {
        for (var n = 0; n < userAtWorkList.length; n++) {
            if(userList[m].userId == userAtWorkList[n].userId){
                t = t.concat(userList.splice(m,1))
            }
        }
    }
    userList = t.concat(userList)
    this.state.dataMap.set(deptId, userList);
    this.setState({userList:userList, dataSource:this.state.dataSource.cloneWithRows(userList), });
  }


  loadDetail() {
    var that = this;
    Request.requestGet(RepairDetail+this.state.repairId, null, (result)=> {
        if (result && result.code === 200) {
            var detaiData = result.data
            that.setState({
                detaiData:detaiData,
                selectDeptName:detaiData.repairDeptName,
                deptId:detaiData.repairDeptId
            });
            this.getUserListByDeptId();
            this.getUserAtWorkListByDeptId();
        } else {

        }
    });
  }

  _onSure() {
    // if (this.state.selectDeptPos === -1) {
    //     toastShort('请选择班组');
    //     return;
    // }

    if (this.state.selectUserPos === -1) {
        toastShort('请选择维修人员');
        return;
    }

    if (this.state.detaiData === -1) {
        toastShort('维修信息为空');
        return;
    }

     let params = {
        repairId: ''+this.state.repairId,
        repairUserId: ''+this.state.selectUserData.userId,
        repairDeptId: ''+this.state.deptId,
        userId:''+global.uinfo.userId,
        remark:''
        };

        // this.props.navigation.state.params.callback();
        console.log(this.props.navigation)
        


     Request.requestPost(DispatchWork, params, (result)=> {
        console.log(params) 
        console.log(result)
        if (result && result.code === 200 && !result.data.error) {
            toastShort('派工成功');
            // this.props.navigation.state.params.callback();
            const {navigation} = this.props;
            InteractionManager.runAfterInteractions(() => {
                navigation.navigate('WorkManager',{
                        theme:this.theme
                        })
            });

        } else {
            if (result && result.data && result.data.error){
                toastShort(result.data.message);
            } else {
                    toastShort('派工失败，请重新尝试');
            }
        }
     });

  }

  render() {
    var detaiData = this.state.detaiData;
    var detailAddress = null;
    var matterName = null;
    var repairNo = null;
    var createTime = null;
    var repairHours = null;
    var repairUserName = null;
    var telNo = null;
    if (detaiData) {
        console.log(detaiData)
        detailAddress = detaiData.detailAddress;
        matterName = detaiData.matterName;
        repairNo = detaiData.repairNo;
        createTime = new Date(detaiData.createTime).format("yyyy-MM-dd hh:mm:ss");

        if (detaiData.hours.hoursRequest) {
            // maio / 60 /60
            var desc = detaiData.hours.hoursRequest
            var hours = null;
            hours  = (desc/3600).toFixed(1)
            repairHours = hours+'小时';
        }
        // repairHours = detaiData.hours.hoursServiceDesc
        repairUserName = detaiData.ownerName ? detaiData.ownerName : '略';
        telNo = detaiData.telNo;
    }

    var uriImg = null;
    var voiceView = null;
    if (detaiData&&detaiData.fileMap) {
       if (detaiData.fileMap.imagesRequest && detaiData.fileMap.imagesRequest.length > 0) {
          uriImg = detaiData.fileMap.imagesRequest[0].filePath;
       }
    }

    return (
      <View style={styles.container}>
         <TitleBar
                    centerText={'派工'}
                    isShowLeftBackIcon={true}
                    navigation={this.props.navigation}
            />
        <Text style={{color:'#999',fontSize:14, height:40, textAlignVertical:'center',paddingLeft:15,}}>请选择维修人员</Text>
        {/* <TouchableOpacity onPress={()=>{this.selectDept()}} style={{height:40}}>
        </TouchableOpacity> */}
        <View style={{backgroundColor:'white', height:40, textAlignVertical:'center',marginLeft:15, marginRight:15, flexDirection:'row',alignItems:'center',}}>
            <Text style={{color:'#999',fontSize:14, height:40, textAlignVertical:'center', marginLeft:10,}}>班组</Text>
            
            <View style={{justifyContent:'flex-end',flexDirection:'row',alignItems:'center', flex:1,paddingRight:10}}>
                <Text style={{color:'#333',fontSize:14, height:40, marginLeft:20,textAlignVertical:'center'}}>{this.state.selectDeptName}</Text>
            </View>
        </View>
        
        <View style={styles.line} />
        <TouchableOpacity onPress={()=>{this.selectUser()}} style={{height:40}}>
        <View style={{backgroundColor:'white', height:40, textAlignVertical:'center',marginLeft:15, marginRight:15, flexDirection:'row',alignItems:'center',}}>
            <Text style={{color:'#999',fontSize:14, height:40, textAlignVertical:'center', marginLeft:10,}}>人员</Text>
            <Text style={{color:'#333',fontSize:14, height:40, marginLeft:20,textAlignVertical:'center'}}>{this.state.selectUserName}</Text>
            <View style={{justifyContent:'flex-end',flexDirection:'row',alignItems:'center', flex:1}}>
                                <Image source={require('../../../res/login/ic_arrow.png')}
                                       style={{width:6,height:11,marginLeft:10, marginRight:10,}}/>

            </View>
        </View>
        </TouchableOpacity>
        <View style={{backgroundColor:'white', marginLeft:15, marginRight:15, marginTop:10, }} >
              <Text style={{fontSize:13,color:'#333',marginLeft:10,marginTop:3,}}>报修内容：{matterName}</Text>
              <View style={{height:1, width:Dimens.screen_width-50, marginTop:5, marginLeft:10, marginRight:10, backgroundColor:'#eeeeee'}}/>
              <View style={{marginLeft:0, marginTop:10, justifyContent:'center', textAlignVertical:'center', flexDirection:'row',alignItems:'center',}} >
                <View style={{marginLeft:10, justifyContent:'center', textAlignVertical:'center', alignItems:'center',width:60,}} >
                    <Image source={{uri:uriImg}} style={{width:60,height:60,marginLeft:0}}/>

                </View>
                <View style={{marginLeft:5, flex:1, }} >
                    <View style={{marginLeft:0, marginTop:0, flexDirection:'row',}} >
                        <Text style={{fontSize:12,color:'#999',marginLeft:0,marginTop:3,}}>报修单号：</Text>
                        <Text style={{fontSize:12,color:'#333',marginLeft:5,marginTop:3,width:'60%'}}>{repairNo}</Text>
                    </View>
                    <View style={{marginLeft:0, marginTop:3, flexDirection:'row',}} >
                        <Text style={{fontSize:12,color:'#999',marginLeft:0,marginTop:0,}}>报修时间：</Text>
                        <Text style={{fontSize:12,color:'#333',marginLeft:5,marginTop:0,width:'60%'}}>{createTime}</Text>
                    </View>
                    <View style={{marginLeft:0, marginTop:3, flexDirection:'row',}} >
                        <Text style={{fontSize:12,color:'#999',marginLeft:0,marginTop:0,}}>已耗时长：</Text>
                        <Text style={{fontSize:12,color:'#333',marginLeft:5,marginTop:0,width:'60%'}}>{repairHours}</Text>
                    </View>
                    <View style={{marginLeft:0, marginTop:3, flexDirection:'row',}} >
                        <Text style={{fontSize:12,color:'#999',marginLeft:0,marginTop:0,}}>报修位置：</Text>
                        <Text style={{fontSize:12,color:'#333',marginLeft:5,marginTop:0,width:'60%'}}>{detailAddress}</Text>
                    </View>
                    <View style={{marginLeft:0, marginTop:3, flexDirection:'row',}} >
                        <Text style={{fontSize:12,color:'#999',marginLeft:0,marginTop:0,}}>报修人员：</Text>
                        <Text style={{fontSize:12,color:'#333',marginLeft:5,marginTop:0,width:'60%'}}>{repairUserName}</Text>
                        <TouchableOpacity onPress={()=>{this.callPhone(telNo)}} style={{marginLeft:5}}>
                            <Image source={require('../../../res/repair/list_call.png')} style={{width:20,height:20,}}/>
                        </TouchableOpacity>
                    </View>
                </View>
              </View>
              <View style={{backgroundColor:'white', height:10, }} />
          </View>

          <Text
            onPress={()=>this._onSure()}
            style={styles.button}>确定</Text>

      <Modal
            animationType={"none"}
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {}}
        >

        <View style={styles.modelStyle}>
            <View style={[styles.popupStyle, {marginTop:(Dimens.screen_height-390)/2,backgroundColor:'#fbfbfb',}]}>
                <Text style={{fontSize:16,color:'#333',marginLeft:0,marginTop:10,textAlign:'center',width:Dimens.screen_width-80, height:40}}>{this.state.modelTitle}</Text>
                <View style={{backgroundColor:'#eeeeee',height:1,width:(Dimens.screen_width-80),}} />
                <ListView
                        initialListSize={1}
                        dataSource={this.state.dataSource}
                        renderRow={(item) => this.renderItem(item)}
                        style={{backgroundColor:'white',flex:1,height:300,width:Dimens.screen_width-80,}}
                        onEndReachedThreshold={10}
                        enableEmptySections={true}
                        renderSeparator={(sectionID, rowID, adjacentRowHighlighted) =>this._renderSeparatorView(sectionID, rowID, adjacentRowHighlighted)}
                        />
                <View style={{backgroundColor:'transparent', flexDirection:'row',textAlignVertical:'center',alignItems:'center',}}>
                    <Text onPress={()=>this.cancel()} style={{borderBottomLeftRadius: 15,textAlignVertical:'center',backgroundColor:'#EFF0F1', color:'#333',fontSize:16, height:40, textAlign:'center', flex:1}}>取消</Text>
                    <Text onPress={()=>this.submit()} style={{borderBottomRightRadius: 15,textAlignVertical:'center',backgroundColor:'#E1E4E8', color:'#333',fontSize:16, height:40, textAlign:'center', flex:1}}>确定</Text>
                </View>
            </View>
        </View>
    </Modal>
      </View>
    )
  }


  callPhone(num) {
    let url = 'tel: ' + num;
    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        console.log('Can\'t handle url: ' + url);
      } else {
        return Linking.openURL(url);
      }
    }).catch(err => console.error('An error occurred', err));
  }

  selectDept() {
        this.setState({
            modelTitle:'选择班组', 
            selectDeptState:true, 
            modalVisible:true, 
            dataSource:this.state.dataSource.cloneWithRows(this.state.deptList), });
  }

  selectUser() {
    // if (this.state.selectDeptPos === -1) {
    //     toastShort('请先选择班组');
    //     return;
    // }
    var userList = this.state.userList
    var list = []
    for(var i = 0;i<userList.length;i++){
        if(userList[i].userId != this.state.detaiData.ownerId){
            list.push(userList[i])
        }
    }
    console.log(list)
    this.setState({
        modelTitle:'选择人员', 
        selectDeptState:false, 
        modalVisible:true, 
        dataSource:this.state.dataSource.cloneWithRows(list), });
  }

  cancel() {
        this.setState({modalVisible:false});
  }

  submit() {
    this.setState({modalVisible:false, selectUserName:this.state.selectUserData.userName});
        // if (this.state.selectDeptState) {
        //     if (this.state.selectDeptPos != -1) {
        //         this.setState({
        //             modalVisible:false, 
        //             //selectDeptName:this.state.selectDeptData.deptName,
        //             //selectUserPos:-1,
        //             selectUserData:null,
        //             selectUserName:null});
        //         //this.getUserListByDeptId();
        //     }

        // } else {
        //     if (this.state.selectUserPos != -1) {
        //         this.setState({modalVisible:false, selectUserName:this.state.selectUserData.userName});
        //     }
        // }
  }

  _renderSeparatorView(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
      <View key={`${sectionID}-${rowID}`} style={styles.separator} />
    );
  }



  onPressItem(data) {
    var pos = 0;

    if (this.state.selectDeptState) {
      var items = this.state.deptList;

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.deptId === data.deptId) {
            pos = i;
        }
    }

      this.setState({dataSource:this.state.dataSource.cloneWithRows(items), selectDeptPos:pos, selectDeptData:data});
    } else {
      var userList = this.state.userList;
      var items = []
        for(var i = 0;i<userList.length;i++){
            if(userList[i].userId != this.state.detaiData.ownerId){
                items.push(userList[i])
            }
        }
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.userId === data.userId) {
            pos = i;
        }
       }

       this.setState({dataSource:this.state.dataSource.cloneWithRows(items), selectUserPos:pos, selectUserData:data});
    }

  }


  renderItem(data) {
    var that = this;
    if (this.state.selectDeptState) {
        return (
            <TouchableOpacity onPress={()=>{that.onPressItem(data)}} style={{height:45,flex:1}}>
                <View style={{flexDirection:'row',marginLeft:15,height:45,textAlignVertical:'center',alignItems: 'center',}} >
                <Image source={this.state.selectDeptData&&this.state.selectDeptData.deptId===data.deptId ? require('../../../res/login/checkbox_pre.png') : require('../../../res/login/checkbox_nor.png')} style={{width:18,height:18}}/>
                <Text style={{fontSize:14,color:'#777',marginLeft:15,}}>{data.deptName}</Text>
                </View>
            </TouchableOpacity>
        );
    } else {
        var userAtWorkImage = <Image source={require('../../../image/no_online.png')} style={{width:18,height:18,marginRight:10}}/>;
        this.state.userAtWorkList.find(item=>{
            if(item.userId == data.userId){
                userAtWorkImage = <Image source={require('../../../image/online.png')} style={{width:18,height:18,marginRight:10}}/>
            }
        })
        return (
            <TouchableOpacity onPress={()=>{that.onPressItem(data)}} style={{height:45,flex:1}}>
                <View style={{flexDirection:'row',marginLeft:15,height:45,textAlignVertical:'center',alignItems: 'center',}} >
                <Image source={this.state.selectUserData&&this.state.selectUserData.userId===data.userId ? require('../../../res/login/checkbox_pre.png') : require('../../../res/login/checkbox_nor.png')} style={{width:18,height:18}}/>
                <Text style={{fontSize:14,color:'#777',marginLeft:15,flex:1}}>{data.userName}</Text>
                {userAtWorkImage}
                </View>
            </TouchableOpacity>
        );
    }

  }

}


const styles = StyleSheet.create({
    modelStyle:{
        flex: 1,
        width:Dimens.screen_width,
        height:Dimens.screen_height,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    popupStyle:{
        marginLeft:40,
        width:Dimens.screen_width-80,
        height:390,
        backgroundColor: 'white',
        borderBottomRightRadius: 15,
        borderBottomLeftRadius: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius:15,
    },
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },

    welcome:{
        color:'#123456',

    },
    line:{
        backgroundColor:'#eeeeee',height:1,width:(Dimens.screen_width-40),marginTop:0,marginLeft:20,
    },
    button:{
    width:Dimens.screen_width,
    height:46,
    color:'#ffffff',
    fontSize:18,
    textAlign:'center',
    backgroundColor: '#5ec4c8',
    alignItems:'center',
    justifyContent:'center',
    textAlignVertical:'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignSelf: 'center'
  },
    separator: {
       height: 1,
       backgroundColor: '#f6f6f6'
    },
});
