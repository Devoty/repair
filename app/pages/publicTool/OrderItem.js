import React, { Component } from 'react';
import {
    Image,
    Dimensions,
    StyleSheet,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
    View,
    Linking,
    Text,
} from 'react-native';
import {Button, Col, Row, Content, Textarea} from 'native-base';
import Swiper from 'react-native-swiper';
import Axios from '../../util/Axios';
import Video from 'react-native-video';
import { toastShort } from '../../js/util/ToastUtil';
import {getVoicePlayer} from '../../components/VoicePlayer';
import VideoPreview from '../../components/VideoPreview';



/*
* 报修单  报修内容模块 组件化
* */
import moment from "moment";
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;
class Adds extends Component {//报修单共用组件
    constructor(props) {
       super(props);
       this.state = {
           modalVisible: false,
           showText: false,
           cancelVisible: false,
           isPlaying: false,
           isShowEye: false,
           focusId:""
       };
        this.getEysOne();
    }
    //获取关注情况
    getEysOne(){
        Axios.GetAxios("/api/opcs/follow/workFocusInfo/"+this.props.record.repairId).then(
            (response)=>{
                console.log(response);
                if(response && response.code===200){
                    if(response.data.records.length>0 && response.data.records[0].focusStatus === 1){
                        this.setState({isShowEye:true,focusId:response.data.records[0].focusId})
                    }else if(response.data.records.length>0 && response.data.records[0].focusStatus === 0){
                        this.setState({isShowEye:false,focusId:response.data.records[0].focusId})
                    }
                }
            }
        );
    }

    _setModalVisible() {
      this.setState({modalVisible: !this.state.modalVisible});
    }
    _setCancelVisible() {
      this.setState({cancelVisible: !this.state.cancelVisible});
    }
    _showText(){
        this.setState({showText: !this.state.showText});
    }
    //获取报修单图片数量
    getLength(imagesRequest,videosRequest){
        var length = 0;
        if(imagesRequest!=null){
            length += imagesRequest.length;
        }
        if(videosRequest != null ){
            length += videosRequest.length;
        }
        return length;
    }
    //获取报修单首张图片
    getFirstImage(imagesRequest,videosRequest){
        if(imagesRequest != null && imagesRequest.length>0){
            var path = '';
            var i=1;
            imagesRequest.forEach(function(imageItem){
                if(i===1&&imageItem.filePath!=''){
                    path = imageItem.filePath;
                    i=i+1;
                }
            });
            if(i===1){
                return <View style={{width: 70, height: 70, backgroundColor:'#c8c8c8'}}/>;
            }else{
                return <Image resizeMode='stretch' style={{width: 70, height: 70}} source={{uri:path}} />;
            }
        }
        else if(videosRequest != null && videosRequest.length>0){
            var path = '';
            var i=1;
            videosRequest.forEach(function(videoItem){
                if(i===1 && videoItem.filePath != ''){
                    path = videoItem.filePath;
                    i = i+1;
                }
            });
            if(i === 1){
                return <View style={{width: 70, height: 70, backgroundColor:'#c8c8c8'}}/>;
            }
            else{
                return <View style={{width: 70, height: 70, backgroundColor:'#000000'}}>
                            <Image
                                style={{
                                    position: 'absolute',
                                    top: 18,
                                    left: 18,
                                    width: 36,
                                    height: 36,
                                }}
                            source={require('../../image/icon_video_play.png')}/>
                       </View>
            }
        }
        else{
            return <View style={{width: 70, height: 70, backgroundColor:'#c8c8c8'}}/>
        }
    }
    //语音播放
    _showYy(fileMap){
        var voicesRequest = fileMap.voicesRequest;
        if(voicesRequest!=null){
            voicesRequest.forEach(function(voice){
                if(voice.filePath!=null&&voice.filePath!=''){
                    let voicePlayer = getVoicePlayer();
                    console.log(voice.filePath);
                    voicePlayer.voice(voice.filePath,()=>console.log('播放完成'))
                }
            })

        }
    }
  //  添加关注
    getEye(repairId,getEysOne){
        var data ={
            focusUserId:global.userId,
            focusUserName:global.uinfo.userName,
            sourceId:repairId,
            focusType:1,
            bizFlag:1
        }
        Axios.PostAxios("/api/opcs/follow/post",data).then(
            (response)=>{
                setTimeout(function(){
                    toastShort('关注成功');
                    // this.setState({showPause: false});
                    // getRepairList();
                    getEysOne();
                },150)
            }
        )
    }
    killEye(getEysOne){
        var data ={
            focusId: this.state.focusId,
            focusType: 1
        }
        Axios.PostAxios("/api/opcs/follow/off",data).then(
            (response)=>{
                console.log(response);
                setTimeout(function(){
                    toastShort('取消关注');
                    // this.setState({showPause: false});
                    // getRepairList();
                    getEysOne();
                },150)
            }
        )
    }


  render() {
    return (
            <Content style={{backgroundColor:'#fff',marginBottom:10,paddingBottom:10,paddingLeft:16,paddingRight:16,borderRadius:10}}>
                <View  style={{borderBottomWidth:1,borderColor:'#dfdfdf',paddingBottom:10}}>
                    <Row>
                        {(this.props.record.fileMap.voicesRequest !=null && this.props.record.fileMap.voicesRequest.length>0 && this.props.record.fileMap.voicesRequest[0].filePath!=null) &&
                        <TouchableOpacity style={{width:30}} onPress={()=>this._showYy(this.props.record.fileMap)}>
                            <Image style={{marginTop:10,width:25,height:25,paddingRight:5}} source={require("../../image/voice_bf.png")}/>
                        </TouchableOpacity>
                        }
                        <TouchableOpacity style={{width:ScreenWidth-55}} onPress={()=>this._showText()}>
                            {this.state.showText==false &&
                            <Text numberOfLines={1}  style={{marginTop:13,fontSize:14,fontWeight:('bold'),color:'#313131'}}>报修内容：<Text style={stylesBody.orderContext}>{this.props.record.matterName}</Text></Text>
                            }
                            {this.state.showText==true &&
                            <Text  style={{marginTop:13,fontSize:14,fontWeight:('bold'),color:'#313131'}}>报修内容：<Text style={stylesBody.orderContext}>{this.props.record.matterName}</Text></Text>
                            }
                        </TouchableOpacity>
                    </Row>
                </View>
                <Content style={{paddingTop:12}}>
                <TouchableOpacity onPress={() => (this.props.type==='4')?null:this.props.getEvaluate()}>
                    <Row>
                        {this.props.type!=0 &&
                        <Col style={{width:70,marginRight:17,paddingTop:5}}>
                            {this.getFirstImage(this.props.record.fileMap.imagesRequest,this.props.record.fileMap.videosRequest)}
                            <Button transparent style={{position: 'absolute',width:70,height:70}} onPress= {()=>this._setModalVisible()}/>
                            <View style={{position: 'absolute',left:40,top:5,backgroundColor:'#545658',height:20,paddingLeft:8,width:25,borderRadius:10}}><Text style={{color:'#fff'}}>{this.getLength(this.props.record.fileMap.imagesRequest,this.props.record.fileMap.videosRequest)}</Text></View>
                            <View style={{justifyContent:'center', textAlignVertical:'center', alignItems:'center',width:70,}} >
                                <Text style={{fontSize:12,color:'#909399',marginLeft:0,marginTop:5,textAlign:'center', paddingLeft:3, paddingRight:3, paddingTop:3, paddingBottom:3,
                                    borderBottomRightRadius: 5,borderBottomLeftRadius: 5,borderTopLeftRadius: 5,borderTopRightRadius:5,backgroundColor:'#f0f0f0'}}>{this.props.record.statusDesc}</Text>
                            </View>
                        </Col>}
                        <Col>
                            <Row>
                            <Text style={stylesBody.orderContextTip}>报修单号:</Text><Text style={stylesBody.orderContextAut}>{this.props.record.repairNo}</Text>
                            </Row>
                            <Row>
                            <Text style={stylesBody.orderContextTip}>报修时间:</Text><Text style={stylesBody.orderContextAut}>{moment(this.props.record.createTime).format("YYYY-MM-DD HH:mm:ss")}</Text>
                            </Row>
                            <Row>
                            <Text style={stylesBody.orderContextTip}>已耗时长:</Text><Text style={stylesBody.orderContextAut}>{this.props.record.hours+'小时'}</Text>
                            </Row>
                            <Row>
                            <Text style={stylesBody.orderContextTip}>报修位置:</Text>
                            <Text style={stylesBody.orderContextAut}>{this.props.record.detailAddress}</Text>
                            </Row>
                            {
                                this.props.record.isEquipment === 1 && 
                                <Row>
                                    <Text style={stylesBody.orderContextTip}>设备名称:</Text><Text style={stylesBody.orderContextAut}>{this.props.record.equipmentName}</Text>
                                </Row>
                            }
                            <Row>
                            {this.props.record.repairUserName && this.props.record.repairUserName!=="" &&
                                <Row>
                                    <Text style={stylesBody.orderContextTip}>维修人员:</Text><Text style={{fontSize:14,marginLeft:10,color:"#737373"}}>{this.props.record.repairUserName}</Text>
                                </Row>
                            }

                            {(this.props.record.repairUserMobile != '' && this.props.record.repairUserMobile!=null) &&
                                <TouchableOpacity
                                    style={{flex:1,height:20,backgroundColor:'#fff',marginLeft:10}}
                                    onPress={() => Linking.openURL(`tel:${this.props.record.repairUserMobile}`)}>
                                    <Image style={{width:20,height:20}} source={require("../../image/list_call.png")}/>
                                </TouchableOpacity>
                            }
                            </Row>
                        </Col>
                    </Row>
                </TouchableOpacity>
                    <Content>
                        <Row style={{justifyContent:'flex-end',paddingBottom:1,paddingTop:10}}>
                            {this.props.type!='4' &&(this.props.type===1 || this.props.record.status==='0' || this.props.record.status==='1' || this.props.record.status==='2' || this.props.record.status==='3' || this.props.record.status==='5' || this.props.record.status==='6' || this.props.record.status==='7' || this.props.record.status==='12' || this.props.record.status==='13' )&&
                            <Text onPress={()=>this.props.ShowModal(this.props.record.repairId)}  style={{ fontSize:13,color:'#FBA234',marginRight:15,textAlign:'center',textAlignVertical:"center", paddingLeft:7, paddingRight:7, paddingTop:3, paddingBottom:3,
                                borderBottomRightRadius: 5,borderBottomLeftRadius: 5,borderTopLeftRadius: 5,borderTopRightRadius:5, borderWidth:1, borderColor:'#FBA234'}}>催单</Text>
                            }
                            {this.props.type!='4' &&(this.props.type===1 || this.props.record.status==='0' || this.props.record.status==='1' || this.props.record.status==='2' || this.props.record.status==='3' || this.props.record.status==='5' || this.props.record.status==='6' || this.props.record.status==='7' || this.props.record.status==='12' || this.props.record.status==='13' )&&
                            <Text onPress={()=>this._setCancelVisible()} style={{ fontSize:13,color:'#666666',marginRight:15,textAlign:'center',textAlignVertical:"center", paddingLeft:7, paddingRight:7, paddingTop:3, paddingBottom:3,
                                borderBottomRightRadius: 5,borderBottomLeftRadius: 5,borderTopLeftRadius: 5,borderTopRightRadius:5, borderWidth:1, borderColor:'#666666'}}>取消</Text>
                            }
                            {this.props.type!='4' &&(this.props.type===2 || this.props.record.status==='8' )&&
                            <Text onPress={() => this.props.getEvaluate()}  style={{ fontSize:13,color:'#FBA234',marginRight:15,textAlign:'center',textAlignVertical:"center", paddingLeft:7, paddingRight:7, paddingTop:3, paddingBottom:3,
                                borderBottomRightRadius: 5,borderBottomLeftRadius: 5,borderTopLeftRadius: 5,borderTopRightRadius:5, borderWidth:1, borderColor:'#FBA234'}}>评价</Text>
                            }
                            {this.props.type != '4' && (this.props.type === 2 || this.props.type === 1) && this.state.isShowEye === false &&
                            <Text onPress={()=>this.getEye(this.props.record.repairId,()=>this.getEysOne())} style={{ fontSize:13,color:'#666666',marginRight:15,textAlign:'center',textAlignVertical:"center", paddingLeft:7, paddingRight:7, paddingTop:3, paddingBottom:3,
                                borderBottomRightRadius: 5,borderBottomLeftRadius: 5,borderTopLeftRadius: 5,borderTopRightRadius:5, borderWidth:1, borderColor:'#666666'}}>关注</Text>
                            }
                            {this.props.type != '4' && (this.props.type === 2 || this.props.type === 1) && this.state.isShowEye === true &&
                            <Text onPress={()=>this.killEye(()=>this.getEysOne())} style={{ fontSize:13,color:'#666666',marginRight:15,textAlign:'center',textAlignVertical:"center", paddingLeft:7, paddingRight:7, paddingTop:3, paddingBottom:3,
                                borderBottomRightRadius: 5,borderBottomLeftRadius: 5,borderTopLeftRadius: 5,borderTopRightRadius:5, borderWidth:1, borderColor:'#666666'}}>已关注</Text>
                            }
                            </Row>
                        <Modal
                            animationType={"slide"}
                            transparent={true}
                            visible={this.state.modalVisible}
                            onRequestClose={() =>this._setModalVisible()}
                        >
                        <PictureMd Closer = {() => this._setModalVisible()} setModalVisible={()=>this._setModalVisible()} imagesRequest={this.props.record.fileMap.imagesRequest} videosRequest={this.props.record.fileMap.videosRequest}/>
                        </Modal>
                        <Modal
                            animationType={"slide"}
                            transparent={true}
                            visible={this.state.cancelVisible}
                            onRequestClose={() =>this._setCancelVisible()}
                        >
                        <CancelMd Closer = {() => this._setCancelVisible()} getRepairList={()=>this.props.getRepairList()} record={this.props.record}/>
                        </Modal>

                    </Content>
                </Content>
            </Content>

    );
  }
}

/*
* 图片预览图层
* */
class PictureMd extends Component {

    constructor(props) {
        super(props);
        this.state = {
          videoItemRefMap: new Map() //存储子组件模板节点
        }
      }

    onRef = (ref) => {
        this.videoItemRef = ref
        this.appentRefMap(ref.props.num,ref);
      }

      appentRefMap(index,ref){
        let map = this.state.videoItemRefMap;
        map.set(index,ref);
        this.setState({
            videoItemRefMap: map
        });
      }

      setVideoCurrentTime = (index) => {
        let videoItemRef = this.state.videoItemRefMap.get(index + 1);
        if(videoItemRef){
            videoItemRef.setVideoCurrentTime();
        }
      }
    //图片渲染
    getImageItem(imagesRequest,videosRequest,setModalVisible){
        var i = 0;
        var j = 0;
        var listItems = [];

        if((imagesRequest == null || imagesRequest.length == 0) && (videosRequest == null || videosRequest.length == 0)){
            listItems = <View style={{width:"100%",height:"100%",backgroundColor:'#222',justifyContent:'center',alignItems:"center"}}><Text style={{color:'#666',fontSize:16}}>暂无图片</Text></View>
            return listItems;
        }

        if(imagesRequest != null && imagesRequest.length>0){
            j = imagesRequest.length;
            i += imagesRequest.length;
        }
        if(videosRequest != null && videosRequest.length>0){
            i += videosRequest.length;
        }

        if(imagesRequest!=null && imagesRequest.length > 0){
            listItems =(  imagesRequest === null ? null : imagesRequest.map((imageItem, index) =>
                <ImageItem num={index+1} sum={i} setModalVisible={setModalVisible} imageurl={imageItem.filePath} key={index}/>
            ))
        }
        if(videosRequest!=null && videosRequest.length > 0){
             let videoItems =(  videosRequest === null ? null : videosRequest.map((videoItem, index) =>
                <VideoPreview  onRef={this.onRef} setModalVisible={setModalVisible} num={index+1+j} sum={i}  url={videoItem.filePath} fileName={videoItem.fileName} key={index}/>
            ))
            listItems = listItems.concat(videoItems);
        }

        return listItems;
    }

        render(){
            return (
                <View style={stylesImage.container}>
                    <TouchableOpacity  style={{height:ScreenHeight/2}} onPress={this.props.Closer}>
                    </TouchableOpacity>
                         <View style={{width:ScreenWidth,height:ScreenHeight,alignItems:'center',backgroundColor:'rgba(0, 0, 0, 0.5)',justifyContent:'center'}}>
                         <Swiper
                         style={{width:ScreenWidth,height:ScreenHeight}}
                           onMomentumScrollEnd={(e, state, context) => (console.log('index:', state.index),this.setVideoCurrentTime(state.index))}
                           dot={<View style={{backgroundColor: 'rgba(0,0,0,0.2)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
                           activeDot={<View style={{backgroundColor: '#000', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
                           paginationStyle={{
                             bottom: -23, left: null, right: 10
                           }} loop>
                           {this.getImageItem(this.props.imagesRequest,this.props.videosRequest,this.props.setModalVisible)}
                         </Swiper>
                         </View>
                    <TouchableOpacity  style={{height:ScreenHeight/2}} onPress={this.props.Closer}>
                    </TouchableOpacity>
                </View>
            );
        }
}
class ImageItem extends Component{
    render(){
        return (
            <View style={stylesImage.slide}>
                <TouchableOpacity activeOpacity={1} style={{zIndex:1,flex:1}} onPress={()=> this.props.setModalVisible()}>
                    {/*<Image source={require('../../res/repair/ic_photo_close.png')} style={{width:20,height:25,marginRight:10,marginTop:18, }}/>*/}

                <Image resizeMode='contain' style={stylesImage.image} source={{uri:this.props.imageurl}} />
                <View style={{position: 'relative',left:ScreenWidth-70,top:-40,backgroundColor:'#545658',height:22,paddingLeft:2,width:40,borderRadius:10}}><Text style={{color:'#fff',paddingLeft:5}}>{this.props.num}/{this.props.sum}</Text></View>
                </TouchableOpacity>
                </View>
        )
    }
}

const PreVideo  = (video) => {
    return (
        <Video source={{uri: video.uri}}
               style={{position: 'absolute',
                   top: 0,
                   left: 0,
                   bottom: 0,
                   right: 0,
                   width: 70,
                   height: 70
               }}
               rate={1}
               paused={true}
               volume={1}
               muted={false}
               resizeMode={'cover'}
               onError={e => console.log(e)}
               onLoad={load => console.log(load)}
               repeat={false} />
    );
}
/*
* 报修单取消图层
* */
class CancelMd extends Component {

    constructor(props) {
       super(props);
       this.state = {
              causeList:[],
              reMark:'',
              showPause: false
              };
       var   url="/api/admin/sysCause/list/REP_CANCEL";
        Axios.GetAxios(url).then(
            (response) => {
                    var causeList = response.data;
                    var causeListTemp = [];
                    causeList.forEach(function(cause){
                    let newCause = {causeCtn:cause.causeCtn,causeId:cause.causeId,showType:false};
                    causeListTemp.push(newCause);
                   });
                    this.setState({causeList:causeListTemp})
                }
        )
    }
    //取消原因变更
    changeCause(visible){
        var causeList = [];
        causeList = this.state.causeList;
        causeList.forEach(function(cause){
            if(cause.causeId == visible.causeId){
                cause.showType=!cause.showType;
            }
        });
        this.setState({causeList:causeList,showPause: false});
    }
    //取消原因按钮渲染
    _getCauseItem(){
        var causeList = [];
        causeList = this.state.causeList;
        let listItems =(  causeList === null ? null : causeList.map((cause, index) =>
            <Button key={index} onPress={()=>this.changeCause(cause)}  style={{borderColor:(cause.showType===false)?'#efefef':'#7db4dd',backgroundColor:(cause.showType===false)?'#fff':'#ddeaf3',borderWidth:1,marginRight:15,paddingLeft:15,paddingRight:15,height:30,marginTop:12}}>
                <Text style={{color:(cause.showType===false)?'#a1a1a3':'#70a1ca'}}>{cause.causeCtn}</Text>
            </Button>
        ))
        return listItems;
    }
    _setRemark(remark){
        this.setState({reMark:remark});
    }
    //取消原因提交
    pushCancel(record,getRepairList,closer){
       var   url="/api/repair/request/misinform";
       var causeList = this.state.causeList;
       var causeIds = [];
        causeList.forEach(function(cause){
            if(cause.showType===true){
            causeIds.push(cause.causeId);
            }
        })
        if(causeIds.length===0){
            // toastShort('请选择取消原因');
            this.setState({showPause:true});
            return null;
        }
        console.log("取消ID：");
        console.log(record.repairId);
       var data ={
                 repairId: record.repairId,
                 userId : global.userId,
                 remark:this.state.reMark,
                 causeIds:causeIds,
                 }
       var headers={
                    'Content-type':'application/json',
               }
        Axios.PostAxios(url,data,headers).then(
            (response) => {
                        setTimeout(function(){
                            toastShort('取消成功');
                            // this.setState({showPause: false});
                            closer();
                            getRepairList();
                        },200)
                    }
        )

    }

        render(){
            return (
                <View style={modalStyles.container}>
                    <TouchableOpacity  style={{height:ScreenHeight/2}} onPress={this.props.Closer}>
                    </TouchableOpacity>
                    <View style={modalStyles.innerContainer}>
                        <Col style={{width:ScreenWidth-60,borderRadius:10,backgroundColor:'#f8f8f8',padding:10}}>
                            <Text style={{color:'#a1a1a3'}}>请选择取消原因</Text>
                            {
                                this.state.showPause ? <Text style={{color:'red',fontSize:12, height:17, textAlignVertical:'center'}}>暂停原因不能为空</Text> : null
                            }
                            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                                {this._getCauseItem()}
                            </View>
                            <Textarea bordered rowSpan={5} maxLength={150} onChangeText={(remark)=>{this.setState({reMark:remark})}}  placeholder="亲，请输入您取消的原因..."  style={{width:ScreenWidth-80,height:110,borderRadius:5,backgroundColor:'#fff',marginTop:20}}>
                                {this.state.reMark}
                            </Textarea>
                            <Button style={{width:60,marginLeft:ScreenWidth-140,alignItems:'center',justifyContent:"center",backgroundColor:'#fff',marginTop:12}}
                                onPress={()=>{this.pushCancel(this.props.record,()=>this.props.getRepairList(),()=>this.props.Closer())}}>
                                <Text>确认</Text>
                            </Button>
                         </Col>
                    </View>
                    <TouchableOpacity  style={{height:ScreenHeight/2}} onPress={this.props.Closer}>
                    </TouchableOpacity>
                </View>
            );
        }
}



const stylesImage =StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    innerContainer: {
        borderRadius: 10,
        alignItems:'center',
    },
    slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
    },
    image: {
    width:ScreenWidth,
    flex: 1,
    }
})
const stylesBody=StyleSheet.create({
    orderContext:{
        fontSize:14,
        color:'#737373',
        fontWeight:('normal')
    },
    orderContextTip:{
        fontSize:14,
        color:'#a9a9a9',
    },
    orderContextAut:{
        width:'60%',
        fontSize:14,
        color:'#737373',
        marginLeft:10
    }
});
const modalStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    innerContainer: {
        borderRadius: 10,
        alignItems:'center',
    },
    btnContainer:{
        width:ScreenWidth,
        height:46,
        borderRadius: 5,
        backgroundColor:'#eff0f2',
        alignItems:'center',
        paddingTop:8
    },

});

const causeStyle =StyleSheet.create({
  causeBtn: {
    width:'30%',
    height:35,
    borderRadius:10,
    backgroundColor:'#fff',
    borderColor: '#c2c2c2',
    marginRight:"3.33%",
    marginTop:13
  },
  causeBtnPro: {
    width:'30%',
    height:35,
    borderRadius:10,
    backgroundColor:'#e1f0fd',
    borderColor:'#50a9ef',
    marginRight:"3.33%",
    marginTop:13
  },
})




module.exports=Adds;
