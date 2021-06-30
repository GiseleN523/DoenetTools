import React, { useRef } from 'react';
import { useRecoilValue, useRecoilCallback } from 'recoil'
import { searchParamAtomFamily, toolViewAtom } from '../NewToolRoot';



export default function CourseToolHandler(props){
  console.log(">>>===CourseToolHandler")
  let lastTool = useRef(null);
  const setTool = useRecoilCallback(({set})=> (tool,lastTool)=>{
    console.log(`>>>setTool >${tool}< >${lastTool}<`)
    //Set starting tool
    if (tool === ""){
      tool = 'courseChooser';
      window.history.pushState('','','/new#/course?tool=courseChooser')
    }
    if (tool === lastTool){ return; }

      if (tool === 'courseChooser'){
        set(toolViewAtom,(was)=>{
          let newObj = {...was}
          newObj.currentMainPanel = "DriveCards";
          newObj.currentMenus = ["CreateCourse","CourseEnroll"];
          newObj.menusTitles = ["Create Course","Enroll"];
          newObj.menusInitOpen = [true,false];
          return newObj;
        });
      }else if (tool === 'editor'){
        console.log(">>>editor!")
        // set(toolViewAtom,(was)=>{
        //   let newObj = {...was}
        //   newObj.currentMainPanel = "DriveCards";
        //   return newObj;
        // });
      }else{
        console.log(">>>didn't match!")
      }
  })
  const tool = useRecoilValue(searchParamAtomFamily('tool')) 


  if (tool !== lastTool.current){
    console.log(">>>CourseToolHandler tool>>>",tool)
    setTool(tool,lastTool.current)
    lastTool.current = tool;
  }
  return null;

}