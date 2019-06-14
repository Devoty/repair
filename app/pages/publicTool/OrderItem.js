import React, { Component } from 'react';
import {
    Image,
    Alert,
    Dimensions,
    StyleSheet,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
    View,
    TextInput,
    Linking,
    Text,
    ActivityIndicator,
} from 'react-native';
import {  Item,Input,Button,Icon,ScrollableTab, Tabs, Tab , Col, Row, Container, Content, Header, Left, Body, Right,  List, ListItem, Thumbnail,Textarea} from 'native-base';
import Swiper from 'react-native-swiper';
import Axios from '../../util/Axios';
import Sound from "react-native-sound";
import Video from 'react-native-video';
import VideoPlayer from '../../components/VideoPlayer';
import { toastShort } from '../../js/util/ToastUtil';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from '../../util/RNFetchBlob';
import {getVoicePlayer} from '../../components/VoicePlayer'

import moment from "moment";
let ScreenWidth = Dimensions.get('window').width;
let ScreenHeight = Dimensions.get('window').height;
let dialogWidth = ScreenWidth-80;
class Adds extends Component {//报修单共用组件
    constructor(props) {
       super(props);
       this.state = {
           modalVisible: false,
           showText: false,
           cancelVisible: false,
           isPlaying: false
       };
    }
    onClose() {
       this.setState({modalVisible: false});
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
    _showYy(fileMap){
        var voicesRequest = fileMap.voicesRequest;
        if(voicesRequest!=null){
            voicesRequest.forEach(function(voice){
                if(voice.filePath!=null&&voice.filePath!=''){
                    let voicePlayer = getVoicePlayer();
                    voicePlayer.voice(voice.filePath,()=>console.log('播放完成'))
                    // setTimeout(() => {
                    //     var sound = new Sound(voice.filePath, null, (error) => {
                    //         if (error) {
                    //             console.log('failed to load the sound', error);
                    //         }
                    //         sound.play(() => sound.release());
                    //     });
                    // }, 100);
                }
            })

        }
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
                        <Col style={{width:70,marginRight:17}}>
                            {this.getFirstImage(this.props.record.fileMap.imagesRequest,this.props.record.fileMap.videosRequest)}
                            <Button transparent style={{position: 'absolute',width:70,height:70}} onPress= {()=>this._setModalVisible()}/>
                            <View style={{position: 'absolute',left:40,top:5,backgroundColor:'#545658',height:20,paddingLeft:8,width:25,borderRadius:10}}><Text style={{color:'#fff'}}>{this.getLength(this.props.record.fileMap.imagesRequest,this.props.record.fileMap.videosRequest)}</Text></View>
                                {this.props.record.status==='6' &&
                                  <Text style={{color:'#e74949',alignItems:'center',marginLeft:10}}>暂停中</Text>
                                }
                                {this.props.record.status==='11' &&
                                  <Text style={{color:'#e74949',alignItems:'center',marginLeft:10}}>已取消</Text>
                                }
                                {this.props.record.status==='10' &&
                                  <Text style={{color:'#e74949',alignItems:'center',marginLeft:10}}> 误报</Text>
                                }
                                {this.props.record.status==='9' &&
                                  <Text style={{color:'#6de37e',alignItems:'center',marginLeft:10}}>已评价</Text>
                                }
                                {this.props.record.status==='13' &&
                                  <Text style={{color:'#f0e292',alignItems:'center',marginLeft:10}}> 委外</Text>
                                }
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
                            <Text style={stylesBody.orderContextTip}>报修位置:</Text><Text style={stylesBody.orderContextAut}>{this.props.record.detailAddress}</Text>
                            </Row>
                            <Row>
                            <Text style={stylesBody.orderContextTip}>维修人员:</Text><Text style={{fontSize:14,marginLeft:10,color:"#737373"}}>{this.props.record.repairUserName}</Text>
                            {(this.props.record.repairUserMobile != '' && this.props.record.repairUserMobile!=null) &&
                                <TouchableHighlight
                                    style={{width:20,height:20,backgroundColor:'#fff',marginLeft:10}}
                                    onPress={() => Linking.openURL(`tel:${this.props.record.repairUserMobile}`)}>
                                    <Image style={{width:20,height:20}} source={require("../../image/list_call.png")}/>
                                </TouchableHighlight>
                            }
                            </Row>
                        </Col>
                    </Row>
                </TouchableOpacity>
                    <Content>
                        <Row style={{justifyContent:'flex-end',paddingBottom:1,paddingTop:10}}>
                            {this.props.type!='4' &&(this.props.type===1 || this.props.record.status==='0' || this.props.record.status==='1' || this.props.record.status==='2' || this.props.record.status==='3' || this.props.record.status==='5' || this.props.record.status==='6' || this.props.record.status==='7' || this.props.record.status==='12' || this.props.record.status==='13' )&&
                                <Button
                                bordered
                                style={{borderColor:'#fcb155',height:30,width:60,marginRight:10,justifyContent:'center',alignItems:'center'}}
                                onPress= {()=>this.props.ShowModal(this.props.record.repairId)}
                                >
                                  <Text style={{color:'#fcb155',fontSize:12}}>催单</Text>
                                </Button>
                            }
                            {this.props.type!='4' &&(this.props.type===1 || this.props.record.status==='0' || this.props.record.status==='1' || this.props.record.status==='2' || this.props.record.status==='3' || this.props.record.status==='5' || this.props.record.status==='6' || this.props.record.status==='7' || this.props.record.status==='12' || this.props.record.status==='13' )&&
                                <Button bordered
                                    onPress= {()=>this._setCancelVisible()}
                                    style={{borderColor:'#ededed',height:30,width:60,marginRight:10,justifyContent:'center',alignItems:'center'}}>
                                  <Text style={{color:'#6b6b6b',fontSize:12}}>取消</Text>
                                </Button>
                            }
                            {this.props.type!='4' &&(this.props.type===2 || this.props.record.status==='8' )&&
                                <Button
                                bordered
                                onPress={() => this.props.getEvaluate()}
                                style={{borderColor:'#fcb155',height:30,width:60,marginRight:10,justifyContent:'center',alignItems:'center'}}
                                >
                                  <Text style={{color:'#fcb155',fontSize:12}}>评价</Text>
                                </Button>
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
                <ImageItem num={index+1} sum={i}  imageurl={imageItem.filePath} key={index}/>
            ))
        }
        if(videosRequest!=null && videosRequest.length > 0){
             let videoItems =(  videosRequest === null ? null : videosRequest.map((videoItem, index) =>
                <VideoItem  onRef={this.onRef} setModalVisible={setModalVisible} num={index+1+j} sum={i}  imageurl={videoItem.filePath} fileName={videoItem.fileName} key={index}/>
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
                <Image resizeMode='contain' style={stylesImage.image} source={{uri:this.props.imageurl}} />
                <View style={{position: 'relative',left:ScreenWidth-70,top:-40,backgroundColor:'#545658',height:22,paddingLeft:2,width:40,borderRadius:10}}><Text style={{color:'#fff',paddingLeft:5}}>{this.props.num}/{this.props.sum}</Text></View>
            </View>
        )
    }
}

class VideoItem extends Component{

        //获取VideoPlayer组件模板元素
    onRef = (ref) => {
        this.videoPlayerRef = ref;
    }

    componentDidMount(){
        this.props.onRef(this);
    }

    setVideoCurrentTime = (e) =>{
      if(this.videoPlayerRef){
          this.videoPlayerRef.setVideoCurrentTime(0);
      }
    }

    constructor(props) {
        super(props);
        this.state = {
            videoPath: null,
            animating: true
        };
        this.getVideoFilePath(this.props.imageurl,this.props.fileName);
    }

    getVideoFilePath(path,fileName){
        AsyncStorage.getItem('fileVideoCache', function (error,result) {
                if (error) {
                    console.log('读取失败')
                }else {
                    console.log('读取完成')
                    let fileVideo = JSON.parse(result) || {};
                    if(fileVideo != null && fileVideo[fileName]){
                        this.setState({
                            videoPath : fileVideo[fileName],
                            animating: false
                        })
                    }else{
                        RNFetchBlob.fileVideoCache(path,fileName).then((res) => {
                            fileVideo[fileName] = res.path()
                            //json转成字符串
                            let jsonStr = JSON.stringify(fileVideo);
                            AsyncStorage.setItem('fileVideoCache', jsonStr, function (error) {
                                if (error) {
                                    console.log('存储失败')
                                }else {
                                    console.log('存储完成')
                                }
                            })
                            this.setState({
                                videoPath : res.path(),
                                animating: false
                            })
                        }).catch((error) => {
                            console.info("存储失败" + error)
                        });
                    }
                }
            }.bind(this)
        )
    }

    render(){
        return (
            <View style={stylesImage.slide}>
                {
                    this.state.videoPath == null ? <View style={stylesImage.image}><Loading animating={this.state.animating}/></View>
                    : <VideoPlayer onRef={this.onRef} closeVideoPlayer={()=> {this.props.setModalVisible()}} uri={this.state.videoPath}></VideoPlayer>
                }
                <View style={{position: 'relative',left:ScreenWidth-70,top:-40,backgroundColor:'#545658',height:22,paddingLeft:2,width:40,borderRadius:10}}><Text style={{color:'#fff',paddingLeft:5}}>{this.props.num}/{this.props.sum}</Text></View>
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

class CancelMd extends Component {

    constructor(props) {
       super(props);
       this.state = {
              causeList:[],
              reMark:'',
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
    changeCause(visible){
        var causeList = [];
        causeList = this.state.causeList;
        causeList.forEach(function(cause){
            if(cause.causeId == visible.causeId){
                cause.showType=!cause.showType;
            }
        });
        this.setState({causeList:causeList});
    }

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
    pushCancel(record,getRepairList){
       var   url="/api/repair/request/misinform";
       var causeList = this.state.causeList;
       var causeIds = [];
        causeList.forEach(function(cause){
            if(cause.showType===true){
            causeIds.push(cause.causeId);
            }
        })
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
                            <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                                {this._getCauseItem()}
                            </View>
                            <Textarea bordered rowSpan={5} maxLength={150} onChangeText={(remark)=>{this.setState({reMark:remark})}}  placeholder="亲，请输入您取消的原因..."  style={{width:ScreenWidth-80,height:110,borderRadius:5,backgroundColor:'#fff',marginTop:20}}>
                                {this.state.reMark}
                            </Textarea>
                            <Button style={{width:60,marginLeft:ScreenWidth-140,alignItems:'center',justifyContent:"center",backgroundColor:'#fff',marginTop:12}}
                                onPress={()=>{this.props.Closer(),this.pushCancel(this.props.record,()=>this.props.getRepairList())}}>
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


const Loading = (loading) =>{

    return(
        <View style={loadStyles.wrapper}>
          <View style={loadStyles.box}>
            <ActivityIndicator
              animating={loading.animating}
              color='white'
              size='large'
            />
          </View>
        </View>
    )
}


const loadStyles=StyleSheet.create({
    wrapper:{
      justifyContent:'center',
      alignItems:'center',
      position:'absolute',
      height:Dimensions.get('window').height,
      width:Dimensions.get('window').width,
      zIndex:10,
    },
    box:{
      paddingVertical:12,
      paddingHorizontal:20,
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center',
      borderRadius:6
    },
})


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
