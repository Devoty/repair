

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    DeviceEventEmitter,
    Dimensions,
    InteractionManager,
    TouchableOpacity,
    ScrollView,
    ProgressViewIOS,
} from 'react-native';

import TitleBar from '../../component/TitleBar';
import * as Dimens from '../../value/dimens';
import Request, {GetRepairList, RepairDetail, GetDeptListByType, GetUserListByDeptId, DispatchWork, EvaluateCause} from '../../http/Request';
import { toastShort } from '../../util/ToastUtil';
import BaseComponent from '../../base/BaseComponent'
import Swiper from 'react-native-swiper';
import {Accordion, Content,} from "native-base";

const bannerImgs=[
require('../../../res/default/banner_01.jpg'),
require('../../../res/default/banner_02.jpg'),
require('../../../res/default/banner_03.jpg')
]

export default class HistoryDetail extends BaseComponent {
    static navigationOptions = {
        header: null,
      };
  constructor(props){
    super(props);
    this.state={
            evaluateCauseData:null,
            detaiData:null,
            // repairId:props.repairId,//props.reparid获取不到
            repairId:props.navigation.state.params.repairId,
    }
  }
  componentWillMount() {
    this.loadDetail();
  }
  componentDidMount() {
      
      this.loadEvaluateCause();
  }

  loadDetail() {
    var that = this;
    Request.requestGet(RepairDetail+this.state.repairId, null, (result)=> {   
        if (result && result.code === 200) {
            that.setState({detaiData:result.data});
        } else {
          
        }
    });
  }

loadEvaluateCause() {
    var that = this;
    Request.requestGet(EvaluateCause+this.state.repairId, null, (result)=> {
        if (result && result.code === 200) {
            that.setState({evaluateCauseData:result.data});
        } else {
          
        }
    });
  }

  

  _onSure() {

  }


  renderPersonItem(data,i) {
    var withSel = Math.round(data.itemPercentage*150/100);
      return (
            <View key={i} style={{backgroundColor:'white', height:60, textAlignVertical:'center',marginLeft:0, marginRight:0, marginTop:6,}}>
                <View style={{flexDirection:'row',justifyContent : 'flex-start',marginLeft:10,marginTop:5, }}>
                    <Text style={{color:'#000',fontSize:14, textAlignVertical:'center', width:55}}>{data.assistantName}</Text>
                    <Text style={{color:'#000',fontSize:13, textAlignVertical:'center', width:140}}>{data.assistantMobile}</Text>
                    {
                        data.personType == 1 ? <Text style={{color:'#000',fontSize:13, textAlignVertical:'center',}}>主修人</Text> : 
                        <Text style={{color:'#000',fontSize:13, textAlignVertical:'center', marginLeft:5,}}> </Text> 
                    }
                    
                </View>
                <View style={{flexDirection:'row',marginLeft:10,height:25,textAlignVertical:'center',}}>
                    <Text style={{color:'#999',fontSize:12, }}>维修占比</Text>
                    <View style={{marginLeft:10,marginTop:8,flexDirection:'row',height:3,backgroundColor:'#f0f0f0', width: 150}}> 
                        <View style={{flexDirection:'row',height:3,backgroundColor:'#3F9AED', width: withSel}}/>
                    </View>
                    <Text style={{color:'#3F9AED',fontSize:12, marginLeft:10,}}>%{data.itemPercentage}</Text>
                </View>
            </View>
                              
    );
  }



  renderIconItem(data,i) {
      if(i<=0){
          return
      }
      return (<View key={i} style={{backgroundColor:'white',}}>
                   <Image source={require('../../../res/repair/line_wg.png')} style={{width:2,height:50,marginLeft:29,marginTop:0,}}/>
                   <Image source={require('../../../res/repair/steps_xzr.png')} style={{width:18,height:18,marginLeft:21,marginTop:0,}}/>                 
            </View> 
    );
  }
    _renderHeader(item, expanded) {
        return (
            <View style={{
                borderTopWidth:1,
                borderColor:'#fff',
                flexDirection: "row",
                justifyContent:"space-between",
                padding: 10,
                alignItems: "center" ,
                backgroundColor: "#f8f8f8" }}>
                <View style={{flexDirection:"row"}}>
                    {expanded
                        ? <Image style={{ width: 18,height:18 }} source={require('../../../image/collapse_02.png')} />
                        : <Image style={{ width: 18,height:18 }} source={require('../../../image/collapse_01.png')} />}
                    <Text style={{color:'#6b6b6b'}}>
                        {" "}{item.title}
                    </Text>
                </View>
            </View>
        );
    }

    _renderContent(item) {
        return (
            <Content>
                {item.content}
            </Content>
        );
    }

  render() {
    var detaiData = this.state.detaiData;
    var detailAddress = null;
    var matterName = null;
    var repairNo = null;
    var createTime = null;
    var repairHours = null;
    var repairUserName = null;
    var parentTypeName = null;

    var materialList = <Text style={{textAlignVertical:'center',backgroundColor:'white', color:'#999',fontSize:14, height:50, textAlign:'center',}}>暂无内容</Text>;
    var processList = <Text style={{textAlignVertical:'center',backgroundColor:'white', color:'#999',fontSize:14, height:50, textAlign:'center',}}>暂无内容</Text>;
    
    var likedUser = null;
    var remark = null;
    var satisfactionDesc = null;
    var likedDeptName = null;
    var causeViews = null;
    var advViews = null;
    var satisfactionLevel = null;
    if (detaiData) {
        console.log(detaiData)
        var evaluateInfo = detaiData.evaluateInfo;
        if (evaluateInfo) {
            likedUser = evaluateInfo.likedUser;
            remark = evaluateInfo.remark;
            satisfactionDesc = evaluateInfo.satisfactionDesc;
            satisfactionLevel = evaluateInfo.satisfactionLevel;
            likedDeptName = evaluateInfo.likedDeptName;
            var causeList = evaluateInfo.causeList;
            if (causeList && causeList.length) {
                causeViews = causeList.map((item, i)=>this.renderCauseItem(item, i));
            }
        }

        var imagesCompleted = null;
        if (detaiData.fileMap && detaiData.fileMap.imagesCompleted && detaiData.fileMap.imagesCompleted.length) {
            var advList = detaiData.fileMap.imagesCompleted.map((item, i)=>this.renderAdvItem(item, i));
            advViews = <View style={styles.images}>
                        <Swiper autoplay={true} loop = {true} style={styles.images} autoplayTimeout={4} onMomentumScrollEnd={(e, state, context) => console.log('index:', state.index)}
                            dot={<View style={{backgroundColor:'rgba(0,0,0,.2)', width: 6, height: 6,borderRadius: 3, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                        activeDot={<View style={{backgroundColor: 'black', width: 14, height: 6, borderRadius: 3, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
                        paginationStyle={{bottom: 10}}>
                            {advList}
                        </Swiper> 
                    </View>
        }
        
        detailAddress = detaiData.detailAddress;
        matterName = detaiData.matterName;
        repairNo = detaiData.repairNo;
        createTime = new Date(detaiData.createTime).format("yyyy-MM-dd hh:mm:ss");
       
        // if (detaiData.hours.hoursService) {
        //     var desc = detaiData.hours.hoursService
        //     var hours = null;
        //     hours  = (desc/3600).toFixed(1)
        //     repairHours = hours+'小时';
        // }
        repairHours = detaiData.hours.hoursServiceDesc
        repairUserName = detaiData.repairUserName + '   ' + (detaiData.repairTelNo?detaiData.repairTelNo:'');
        parentTypeName = detaiData.repairTypeName;
                if (detaiData.materialList && detaiData.materialList.length > 0) {
            var total = 0;
            for (var i = 0; i < detaiData.materialList.length; i++) {
                var item = detaiData.materialList[i];
                total = total + item.unitPrice*item.qty;
            }

            var list = detaiData.materialList.map((item, i)=>this.renderMaterialItem(item, i));
            materialList = <View>
                            <View style={{backgroundColor:'white', flexDirection:'row',textAlignVertical:'center',alignItems:'center',}}>
                                <Text style={{color:'#333',fontSize:14, height:35, textAlignVertical:'center',marginLeft:15,}}>名称</Text>
                                <View style={{justifyContent:'flex-end',flexDirection:'row',alignItems:'center', flex:1}}>
                                    <Text style={{color:'#333',fontSize:13, width:80, height:35, marginLeft:0,marginRight:10,textAlignVertical:'center', textAlign:'center'}}>数量</Text>
                                    <Text style={{color:'#333',fontSize:13, width:80, height:35, marginLeft:0,marginRight:10,textAlignVertical:'center', textAlign:'center'}}>价格</Text>         
                                </View>
                            </View>
                            <View style={{backgroundColor:'#eeeeee',height:1,width:(Dimens.screen_width),}} />
                                {list}
                            <View style={{backgroundColor:'white', paddingTop:5, paddingBottom:5,flexDirection:'row',textAlignVertical:'center',alignItems:'center',}}>
                                <Text style={{color:'#333',fontSize:16,marginLeft:15,}}>合计</Text>
                                <View style={{justifyContent:'flex-end',flexDirection:'row',alignItems:'center', flex:1}}>
                                    <Text style={{color:'#EA6060',fontSize:16, width:70, marginLeft:0,marginRight:10,textAlignVertical:'center', textAlign:'center'}}>¥{total}</Text>       
                                </View>
                            </View>
                        </View>;
        }

        if (detaiData.itemPersonList && detaiData.itemPersonList.length > 0) {
            if (detaiData.itemPersonList.length === 1) {
                processList = <View style={{backgroundColor:'white', paddingTop:10, paddingBottom:10,}}>
                            <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', }}>维修类别：{detaiData.parentTypeName}</Text>
                            <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', marginBottom:10, }}>维修事项：{detaiData.matterName}</Text>
                            <View style={styles.line} />
                            <View style={{flexDirection:'row',}}>
                                    <View style={{backgroundColor:'white',}}>
                                        <Image source={require('../../../res/repair/user_wx.png')} style={{width:30,height:30,marginLeft:15,marginTop:10,}}/>
                                      
                                    </View> 

                                    <View style={{backgroundColor:'white',}}>
                                        <View style={{backgroundColor:'white', height:60, textAlignVertical:'center',marginLeft:0, marginRight:0, marginTop:6,}}>
                                            <View style={{flexDirection:'row',marginLeft:10,marginTop:5, }}>
                                                <Text style={{color:'#000',fontSize:14, textAlignVertical:'center', width:55}}>{detaiData.itemPersonList[0].assistantName}</Text>
                                                <Text style={{color:'#000',fontSize:13, textAlignVertical:'center', marginLeft:10,}}>{detaiData.itemPersonList[0].assistantMobile}</Text>
                                            </View>
                                            <View style={{flexDirection:'row',marginLeft:10,height:25,textAlignVertical:'center',}}>
                                                <Text style={{color:'#999',fontSize:12, }}>维修占比</Text>
                                                <View style={{marginLeft:10,marginTop:8,flexDirection:'row',height:3,backgroundColor:'#f0f0f0', width: 150}}> 
                                                    <View style={{flexDirection:'row',height:3,backgroundColor:'#3F9AED', width: 30}}/>
                                                </View>
                                                <Text style={{color:'#3F9AED',fontSize:12, marginLeft:10,}}>%{detaiData.itemPersonList[0].itemPercentage}</Text>
                                            </View>
                                        </View>
                                                            
                                    </View>
                            </View>
                          </View>
            } else {
                var viewList = detaiData.itemPersonList.map((item, i)=>{
                    if(item.assistantId !=null){
                        return this.renderPersonItem(item, i)
                        }
                    });
                var newList = detaiData.itemPersonList.slice(0); 
                // newList.pop();
                var iconList = newList.map((item, i)=>{
                    if(item.assistantId !=null){
                              console.log(item)
                        return this.renderIconItem(item, i)
                    }
                });
                processList = <View style={{backgroundColor:'white', paddingTop:10, paddingBottom:10,}}>
                            <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', }}>维修类别：{detaiData.parentTypeName}</Text>
                            <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', marginBottom:10, }}>维修事项：{detaiData.matterName}</Text>
                            <View style={styles.line} />
                            <View style={{flexDirection:'row',}}>
                                    <View style={{backgroundColor:'white',}}>
                                        <Image source={require('../../../res/repair/user_wx.png')} style={{width:30,height:30,marginLeft:15,marginTop:10,}}/>
                                        
                                        {iconList}
                                    </View> 
                                    <View style={{backgroundColor:'white',}}>
                                        {viewList}
                                    </View> 
                            </View>
                          </View>
            } 
        }
    }


    return (
      <View style={styles.container}>
      <TitleBar
      centerText={'报修单评价'}
      isShowLeftBackIcon={true}
      navigation={this.props.navigation}
      />
      <ScrollView horizontal={false} indicatorStyle={'white'} showsVerticalScrollIndicator={true} style={{height:Dimens.screen_height-40-64, width:Dimens.screen_width,flex:1}}>


          <Accordion
              dataArray={[{ title: "评价", content:
                  <View>
                      <View style={{backgroundColor:'white', height:40, textAlignVertical:'center',marginLeft:0, marginRight:0, flexDirection:'row',alignItems:'center',}}>
                          <Image source={require('../../../res/repair/user_wx.png')} style={{width:25,height:25,marginLeft:15}}/>
                          <Text style={{color:'#333',fontSize:16, height:40, textAlignVertical:'center', marginLeft:10,}}>{likedUser}</Text>
                          <Text style={{color:'#999',fontSize:13, height:40, marginLeft:10,textAlignVertical:'center'}}>{likedDeptName}</Text>
                          <View style={{justifyContent:'flex-end',flexDirection:'row',alignItems:'center', flex:1}}>
                              {satisfactionLevel==="1" &&
                                <Image source={require('../../../res/repair/ico_bmy_xq.png')} style={{width:17,height:17,marginLeft:10, marginRight:10,}}/>
                              }
                              {satisfactionLevel==="2" &&
                                <Image source={require('../../../res/repair/ico_yb_xq.png')} style={{width:17,height:17,marginLeft:10, marginRight:10,}}/>
                              }
                              {satisfactionLevel==="3" &&
                                <Image source={require('../../../res/repair/ico_my_xq.png')} style={{width:17,height:17,marginLeft:10, marginRight:10,}}/>
                              }

                              <Text style={{color:'#F88F0A',fontSize:13, height:40, marginLeft:0,marginRight:10,textAlignVertical:'center'}}>{satisfactionDesc}</Text>
                          </View>
                      </View>
                      <View style={styles.line} />
                      <View style={{backgroundColor:'white'}}>
                          <Text style={{color:'#666',fontSize:14, marginLeft:15, marginRight:15, marginTop:5, marginBottom:5,}}>{remark}</Text>

                          <View style={{backgroundColor:'white', flexDirection:'row',paddingBottom:10,}}>
                              {causeViews}
                          </View>
                      </View>
                      {advViews}
                  </View>
              }]}
              animation={true}
              expanded={true}
              renderHeader={this._renderHeader.bind(this)}
              renderContent={this._renderContent.bind(this)}
              expanded={0}
          />

          <Accordion
              dataArray={[{ title: "概况", content:
                      <View style={{backgroundColor:'white', paddingBottom:10,}}>
                          <Text style={{color:'#333',fontSize:14, marginLeft:15, marginRight:15, marginTop:10, marginBottom:10,}}>{matterName}</Text>
                          <View style={styles.line} />
                          <View style={{backgroundColor:'white', flexDirection:'row',marginTop:5,}}>
                              <Text style={{fontSize:13,color:'#999',marginLeft:15,textAlign:'left', }}>报修单号：</Text>
                              <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', }}>{repairNo}</Text>
                          </View>
                          <View style={{backgroundColor:'white', flexDirection:'row',marginTop:5,}}>
                              <Text style={{fontSize:13,color:'#999',marginLeft:15,textAlign:'left', }}>报修时间：</Text>
                              <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', }}>{createTime}</Text>
                          </View>
                          <View style={{backgroundColor:'white', flexDirection:'row',marginTop:5,}}>
                              <Text style={{fontSize:13,color:'#999',marginLeft:15,textAlign:'left', }}>维修时长：</Text>
                              <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', }}>{repairHours}</Text>
                          </View>
                          <View style={{backgroundColor:'white', flexDirection:'row',marginTop:5,}}>
                              <Text style={{fontSize:13,color:'#999',marginLeft:15,textAlign:'left', }}>报修地址：</Text>
                              <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', }}>{detailAddress}</Text>
                          </View>
                          <View style={{backgroundColor:'white', flexDirection:'row',marginTop:5,}}>
                              <Text style={{fontSize:13,color:'#999',marginLeft:15,textAlign:'left', }}>维修人员：</Text>
                              <Text style={{fontSize:13,color:'#333',marginLeft:10,textAlign:'left', }}>{repairUserName}</Text>
                          </View>
                      </View>
              }]}
              animation={true}
              expanded={true}
              renderHeader={this._renderHeader.bind(this)}
              renderContent={this._renderContent.bind(this)}
              expanded={0}
          />
          <Accordion
              dataArray={[{ title: "维修事项", content:processList}]}
              animation={true}
              expanded={true}
              renderHeader={this._renderHeader.bind(this)}
              renderContent={this._renderContent.bind(this)}
              expanded={0}
          />
          <Accordion
              dataArray={[{ title: "物料", content:materialList}]}
              animation={true}
              expanded={true}
              renderHeader={this._renderHeader.bind(this)}
              renderContent={this._renderContent.bind(this)}
              expanded={0}
          />
    </ScrollView>
    </View>
    )
}

renderAdvItem(data, i) {
    return (
    <View key={i} style={{backgroundColor:'transparent'}}>
        <Image style={styles.images} source={{uri:data.filePath}} resizeMode={'contain'}/>
    </View>
    );
}

renderCauseItem(data, i) {
    return (
    <Text key={i} style={{fontSize:12,color:'#666666',marginLeft:15,marginTop:5,textAlign:'center', paddingLeft:7, paddingRight:7, paddingTop:3, paddingBottom:3,
                    borderBottomRightRadius: 5,borderBottomLeftRadius: 5,borderTopLeftRadius: 5,borderTopRightRadius:5,backgroundColor:'#eeeeee'}}>{data.causeCtn}</Text>
    );
}

renderMaterialItem(data, i) {
    var that = this;
    return (
    <View key={i}>
        <View style={{backgroundColor:'white', paddingTop:10, paddingBottom:10,flexDirection:'row',textAlignVertical:'center',alignItems:'center',}}>
            <View style={{marginLeft:15,}}>
                <Text style={{color:'#333',fontSize:14,}}>{data.materialName}</Text>
                <Text style={{color:'#999',fontSize:12,}}>规格：{data.spec}；品牌：{data.brand}</Text>
            </View>
            <View style={{justifyContent:'flex-end',flexDirection:'row',alignItems:'center', flex:1}}>
                    <Text style={{color:'#333',fontSize:13, width:70, marginLeft:0,marginRight:10,textAlignVertical:'center', textAlign:'center'}}>x{data.qty}</Text>
                    <Text style={{color:'#333',fontSize:13, width:70, marginLeft:0,marginRight:10,textAlignVertical:'center', textAlign:'center'}}>¥{data.unitPrice}</Text>         
            </View>
        </View>
        <View style={{backgroundColor:'#eeeeee',height:1,width:(Dimens.screen_width),}} />
    </View>
    );
}
}


const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },

    welcome:{
        color:'#123456',

    },
    line:{
        backgroundColor:'#eeeeee',height:1,width:(Dimens.screen_width-15),marginTop:0,marginLeft:15,
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
    images:{
        height:160,
        width: Dimens.screen_width,
    }
});