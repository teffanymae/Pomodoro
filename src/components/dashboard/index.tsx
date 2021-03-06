import React, { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import 'bootstrap/dist/css/bootstrap.min.css';
import CustomTimer from '../custom-timer';
import Favorite from '../favorite';
import Archive from '../archive';
import Statistics from '../statistics';
import DisplayTimer from '../display-timer';
import Task from '../task';

import { CustomVars, TaskVars } from './types';
import { Dboard, Notice, Ul, BtnBlock, Img, TodoBlock, Center, Li } from '../styles';
import { useSelector, useDispatch } from 'react-redux';
import { filterToDo, dragToDo } from '../../redux/actions'

const Dashboard = () => {
  const dispatch = useDispatch();
  const taskList: any = useSelector((state: any) => state.taskListReducer)
  const todo: TaskVars[] = useSelector((state: any) => state.todoReducer)
  const task: TaskVars = useSelector((state: any) => state.taskReducer)
  const custom: CustomVars = useSelector((state: any) => state.customReducer)

  const [activeTimer, setActiveTimer] = useState<string>("pomodoro");

  const [updating, setUpdating] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<any>([])

  const [seconds, setSeconds] = useState<number>(Number(custom.pomodoro) * 60);
  const [count, setCount] = useState<Number>(1);
  const [pomodoroStat, setPomodoroStat] = useState<Number>(0);
  const [shortStat, setShortStat] = useState<Number>(0);
  const [longStat, setLongStat] = useState<Number>(0);
  const [skipStat, setSkipStat] = useState<Number>(0);
  const [cycleStat, setCycleStat] = useState<Number>(0);
  const [timeStat, setTimeStat] = useState<Number>(0);

  const [auto, setAuto] = useState<boolean>(true);
  const [autoButton, setAutoButton] = useState<boolean>(false);
  const [pause, setPause] = useState<boolean>(true);

  const todoBtn = require('../../images/todo.png');
  const hr2Btn = require('../../images/hr2.png');

  let pomodoro = custom.pomodoro, short = custom.short, long = custom.long;

  useEffect(() => {
    const int = setInterval(() => {
      if (activeTimer === "pomodoro") {
        if (pause) {
          setTimeStat(Number(timeStat) + 1)
        }
        if (!pause) {
          setTimeStat(Number(timeStat) + 1)
          setSeconds((s: number) => {
            document.title = `${Math.floor((s - 1) / 60)}:${((s - 1) % 60).toString().padStart(2, "0")} - ${activeTimer}`

            setTimeStat(Number(timeStat) + 1)
            if (s > 0) {
              return s - 1

            } else if (count >= Number(custom.longTrigger)) {
              dispatch(filterToDo(taskList))

              new Notification("Long Start")
              setPomodoroStat(Number(pomodoroStat) + 1);
              timerLong();
              startTimer();
              setCount(1);

            } else {
              dispatch(filterToDo(taskList))
              handleClick();
              new Notification("Short Start")
              timerShort();
              startTimer();
              setPomodoroStat(Number(pomodoroStat) + 1);

              todo.filter((val: TaskVars) => {
                if (1 === Number(val)) {
                  return false
                }
                localStorage.removeItem("taskdata");
                return true
              })
            }
            return s
          });
        } else if (!auto) {
          startTimer();
        }

      } else if (activeTimer === "short") {
        if (!pause) {
          setSeconds((s: number) => {
            setTimeStat(Number(timeStat) + 1)
            document.title = `${Math.floor((s - 1) / 60)}:${((s - 1) % 60).toString().padStart(2, "0")} - ${activeTimer}`
            if (s > 0) {
              return s - 1

            } else {
              pauseTimer();
              setShortStat(Number(shortStat) + 1);
              timerPomodoro();
            }
            return s
          });
        } else if (!auto) {
          startTimer();
        }

      } else if (activeTimer === "long") {
        if (!pause) {
          setSeconds((s: number) => {
            setTimeStat(Number(timeStat) + 1)
            document.title = `${Math.floor((s - 1) / 60)}:${((s - 1) % 60).toString().padStart(2, "0")} - ${activeTimer}`
            if (s > 0) {
              return s - 1

            } else {
              pauseTimer();
              setLongStat(Number(longStat) + 1);
              timerPomodoro();
            }
            return s
          });
        } else if (!auto) {
          startTimer();
        }

      } else {
        if (!pause) {
          setSeconds((s: number) => {
            if (s > 0) {
              return s - 1

            } else if (count >= custom.longTrigger) {
              pauseTimer();
              timerLong();
              startTimer();
              setCount(1);

            } else {
              handleClick();
              pauseTimer();
              timerShort();
            }
            return s
          });
        }
      }
    }, 1000);

    return () => {
      clearInterval(int);
    };
  });

  const startTimer = () => {
    new Notification("Pomodoro Start")
    setPause(false)
  };

  const pauseTimer = () => setPause(true);

  const resetTimer = () => {
    setPause(true);
    if (activeTimer === "pomodoro") {
      setSeconds(Number(pomodoro) * 60);
      setActiveTimer("pomodoro");
    } else if (activeTimer === "short") {
      setSeconds(Number(short) * 60);
      setActiveTimer("short");
    } else if (activeTimer === "long") {
      setSeconds(Number(long) * 60);
      setActiveTimer("long");
    }
  }

  useHotkeys('ctrl+alt+s', () => setPause(false));
  useHotkeys('ctrl+alt+p', () => pauseTimer());
  useHotkeys('ctrl+alt+r', () => resetTimer());

  const handleClick = () => setCount(Number(count) + 1);

  const timerPomodoro = () => {
    setAuto(true);
    setPause(true);
    setActiveTimer("pomodoro");
    setSeconds(Number(pomodoro) * 60);
  }

  const timerShort = () => {
    setAutoButton(false)
    setAuto(true);
    setPause(true);
    setActiveTimer("short");
    setSeconds(Number(short) * 60);
  }

  const timerLong = () => {
    setAutoButton(false)
    setAuto(true);
    setPause(true);
    setActiveTimer("long");
    setSeconds(Number(long) * 60);
  }

  const onDragOver = (val: TaskVars, index: number) => {
    if (draggedItem === val) return;
    let items = todo.filter(todo => todo !== draggedItem);
    items.splice(index, 0, draggedItem);
    dispatch(dragToDo(items))
    localStorage.setItem("taskdata", JSON.stringify(items));
  };

  const [show, setShow] = useState<boolean>(false);
  
  const handleShow = () => {
    setShow(true)
    task.title = '';
    task.notes = '';
  };

  const handleClose = () => {
    setShow(false);
    setUpdating(null);
  }

  return (
    <>
      <Dboard>
        <Center className="container">
          <div className="row">
            <div className="col-lg-6">
              <BtnBlock>
                <CustomTimer
                  setSeconds={setSeconds}
                  activeTimer={activeTimer}
                />
                <Favorite />
                <Archive />
                <Statistics
                  pomodoroStat={pomodoroStat}
                  shortStat={shortStat}
                  longStat={longStat}
                  skipStat={skipStat}
                  timeStat={timeStat}
                  cycleStat={cycleStat}
                />
              </BtnBlock>
              <DisplayTimer
                custom={custom}
                startTimer={startTimer}
                pauseTimer={pauseTimer}
                resetTimer={resetTimer}
                handleClick={handleClick}
                timerPomodoro={timerPomodoro}
                timerShort={timerShort}
                timerLong={timerLong}
                seconds={seconds}
                setSeconds={setSeconds}
                activeTimer={activeTimer}
                setAuto={setAuto}
                autoButton={autoButton}
                setAutoButton={setAutoButton}
                count={count}
                setCount={setCount}
                skipStat={skipStat}
                setSkipStat={setSkipStat}
                cycleStat={cycleStat}
                setCycleStat={setCycleStat}
                updating={updating}
                todo={todo}
                handleShow={handleShow}
                handleClose={handleClose}
                show={show}
              />
            </div>

            <div className="col-lg-6">
              <TodoBlock>
                <Img src={todoBtn} alt="" />
                <Ul>
                  {
                    todo.map((val: TaskVars, index: number) => (
                      <Li key={index} onDragOver={() => onDragOver(val, index)}>
                        <Task
                          val={val}
                          startTimer={startTimer}
                          resetTimer={resetTimer}
                          handleShow={handleShow}
                          setUpdating={setUpdating}
                          setDraggedItem={setDraggedItem}
                        />
                      </Li>
                    ))
                  }
                </Ul>
                <img src={hr2Btn} alt="" />
                <p className="text-right" style={{fontFamily: 'Courier New', fontSize: 13}}>?? Teffany Mae Reyes</p>
              </TodoBlock>
            </div>
          </div>
        </Center>
      </Dboard>
      <Notice>Available for PC users only</Notice>
    </>
  );
}

export default Dashboard;

