'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ArrayElement {
  value: number
  id: string
  isComparing?: boolean
  isSwapping?: boolean
  isSorted?: boolean
  isPivot?: boolean
}

type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap'

const ALGORITHM_INFO = {
  bubble: {
    name: 'Bubble Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
  },
  selection: {
    name: 'Selection Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Finds the minimum element and places it at the beginning, then repeats for the remaining elements.'
  },
  insertion: {
    name: 'Insertion Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Builds the final sorted array one item at a time, inserting each element in its correct position.'
  },
  merge: {
    name: 'Merge Sort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Divides the array into halves, sorts them separately, then merges them back together.'
  },
  quick: {
    name: 'Quick Sort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Picks a pivot element and partitions the array around it, then recursively sorts the partitions.'
  },
  heap: {
    name: 'Heap Sort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description: 'Builds a max heap from the array, then repeatedly extracts the maximum element.'
  }
}

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([])
  const [arraySize, setArraySize] = useState(20)
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble')
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(100)
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  // Add ref to track if sorting should stop
  const shouldStopRef = useRef(false)

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = []
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 300) + 10,
        id: `element-${i}`,
        isComparing: false,
        isSwapping: false,
        isSorted: false
      })
    }
    setArray(newArray)
    setComparisons(0)
    setSwaps(0)
    setCurrentStep('')
  }, [arraySize])

  const sleep = (ms: number) => {
    return new Promise(resolve => {
      if (shouldStopRef.current) {
        resolve(undefined)
        return
      }
      setTimeout(resolve, ms)
    })
  }

  const updateArray = async (newArray: ArrayElement[], step: string = '') => {
    if (shouldStopRef.current) return
    setArray([...newArray])
    setCurrentStep(step)
    return sleep(1000 / speed)
  }

  const bubbleSort = async () => {
    const arr = [...array]
    const n = arr.length

    for (let i = 0; i < n - 1; i++) {
      if (shouldStopRef.current) return
      for (let j = 0; j < n - i - 1; j++) {
        if (shouldStopRef.current) return
        // Highlight comparing elements
        arr[j].isComparing = true
        arr[j + 1].isComparing = true
        await updateArray(arr, `Comparing ${arr[j].value} and ${arr[j + 1].value}`)
        setComparisons(prev => prev + 1)

        if (arr[j].value > arr[j + 1].value) {
          if (shouldStopRef.current) return
          // Mark as swapping
          arr[j].isSwapping = true
          arr[j + 1].isSwapping = true
          await updateArray(arr, `Swapping ${arr[j].value} and ${arr[j + 1].value}`)

            // Perform swap
            ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          setSwaps(prev => prev + 1)
          await updateArray(arr, `Swapped!`)

          arr[j].isSwapping = false
          arr[j + 1].isSwapping = false
        }

        arr[j].isComparing = false
        arr[j + 1].isComparing = false
      }

      // Mark last element as sorted
      arr[n - 1 - i].isSorted = true
      await updateArray(arr, `Element ${arr[n - 1 - i].value} is in its final position`)
    }

    // Mark first element as sorted
    if (arr.length > 0) {
      arr[0].isSorted = true
      await updateArray(arr, 'Sorting complete!')
    }
  }

  const selectionSort = async () => {
    const arr = [...array]
    const n = arr.length

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i
      arr[minIdx].isPivot = true
      await updateArray(arr, `Finding minimum element from position ${i}`)

      for (let j = i + 1; j < n; j++) {
        arr[j].isComparing = true
        await updateArray(arr, `Comparing ${arr[j].value} with current minimum ${arr[minIdx].value}`)
        setComparisons(prev => prev + 1)

        if (arr[j].value < arr[minIdx].value) {
          arr[minIdx].isPivot = false
          minIdx = j
          arr[minIdx].isPivot = true
          await updateArray(arr, `New minimum found: ${arr[minIdx].value}`)
        }

        arr[j].isComparing = false
      }

      if (minIdx !== i) {
        arr[i].isSwapping = true
        arr[minIdx].isSwapping = true
        await updateArray(arr, `Swapping ${arr[i].value} with minimum ${arr[minIdx].value}`)

          ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
        setSwaps(prev => prev + 1)
        await updateArray(arr, 'Swapped!')

        arr[i].isSwapping = false
        arr[minIdx].isSwapping = false
      }

      arr[i].isPivot = false
      arr[i].isSorted = true
      await updateArray(arr, `Position ${i} is now sorted`)
    }

    if (arr.length > 0) {
      arr[n - 1].isSorted = true
      await updateArray(arr, 'Sorting complete!')
    }
  }

  const insertionSort = async () => {
    const arr = [...array]
    const n = arr.length

    for (let i = 1; i < n; i++) {
      const key = arr[i]
      key.isPivot = true
      await updateArray(arr, `Inserting ${key.value} into sorted portion`)

      let j = i - 1

      while (j >= 0) {
        arr[j].isComparing = true
        await updateArray(arr, `Comparing ${key.value} with ${arr[j].value}`)
        setComparisons(prev => prev + 1)

        if (arr[j].value > key.value) {
          arr[j + 1] = arr[j]
          arr[j + 1].isSwapping = true
          await updateArray(arr, `Moving ${arr[j].value} one position right`)
          setSwaps(prev => prev + 1)
          arr[j + 1].isSwapping = false
          j--
        } else {
          break
        }

        arr[j + 1].isComparing = false
      }

      arr[j + 1] = key
      key.isPivot = false
      key.isSorted = true
      await updateArray(arr, `${key.value} inserted at position ${j + 1}`)
    }

    await updateArray(arr, 'Sorting complete!')
  }

  const mergeSort = async () => {
    const arr = [...array]

    const merge = async (left: number, mid: number, right: number) => {
      const leftArr = arr.slice(left, mid + 1)
      const rightArr = arr.slice(mid + 1, right + 1)

      let i = 0, j = 0, k = left

      while (i < leftArr.length && j < rightArr.length) {
        if (shouldStopRef.current) return
        arr[left + i].isComparing = true
        arr[mid + 1 + j].isComparing = true
        await updateArray(arr, `Merging: comparing ${leftArr[i].value} and ${rightArr[j].value}`)
        setComparisons(prev => prev + 1)

        if (leftArr[i].value <= rightArr[j].value) {
          arr[k] = leftArr[i]
          i++
        } else {
          arr[k] = rightArr[j]
          j++
        }

        arr[k].isSwapping = true
        await updateArray(arr, `Placed ${arr[k].value} in merged array`)
        setSwaps(prev => prev + 1)
        arr[k].isSwapping = false

        // Reset comparing states
        if (left + i - 1 >= 0 && left + i - 1 < arr.length) arr[left + i - 1].isComparing = false
        if (mid + 1 + j - 1 >= 0 && mid + 1 + j - 1 < arr.length) arr[mid + 1 + j - 1].isComparing = false

        k++
      }

      while (i < leftArr.length) {
        if (shouldStopRef.current) return
        arr[k] = leftArr[i]
        arr[k].isSwapping = true
        await updateArray(arr, `Copying remaining ${leftArr[i].value}`)
        arr[k].isSwapping = false
        i++
        k++
      }

      while (j < rightArr.length) {
        if (shouldStopRef.current) return
        arr[k] = rightArr[j]
        arr[k].isSwapping = true
        await updateArray(arr, `Copying remaining ${rightArr[j].value}`)
        arr[k].isSwapping = false
        j++
        k++
      }
    }

    const mergeSortHelper = async (left: number, right: number) => {
      if (shouldStopRef.current) return
      if (left < right) {
        const mid = Math.floor((left + right) / 2)

        await mergeSortHelper(left, mid)
        await mergeSortHelper(mid + 1, right)
        await merge(left, mid, right)
      }
    }

    await mergeSortHelper(0, arr.length - 1)

    // Mark all as sorted
    arr.forEach(element => element.isSorted = true)
    await updateArray(arr, 'Merge sort complete!')
  }

  const quickSort = async () => {
    const arr = [...array]

    const partition = async (low: number, high: number): Promise<number> => {
      if (shouldStopRef.current) return -1
      const pivot = arr[high]
      pivot.isPivot = true
      await updateArray(arr, `Pivot selected: ${pivot.value}`)

      let i = low - 1

      for (let j = low; j < high; j++) {
        if (shouldStopRef.current) return -1
        arr[j].isComparing = true
        await updateArray(arr, `Comparing ${arr[j].value} with pivot ${pivot.value}`)
        setComparisons(prev => prev + 1)

        if (arr[j].value < pivot.value) {
          i++
          if (i !== j) {
            arr[i].isSwapping = true
            arr[j].isSwapping = true
            await updateArray(arr, `Swapping ${arr[i].value} and ${arr[j].value}`)

              ;[arr[i], arr[j]] = [arr[j], arr[i]]
            setSwaps(prev => prev + 1)
            await updateArray(arr, 'Swapped!')

            arr[i].isSwapping = false
            arr[j].isSwapping = false
          }
        }

        arr[j].isComparing = false
      }

      if (i + 1 !== high) {
        arr[i + 1].isSwapping = true
        arr[high].isSwapping = true
        await updateArray(arr, `Placing pivot ${pivot.value} in correct position`)

          ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
        setSwaps(prev => prev + 1)
        await updateArray(arr, 'Pivot placed!')

        arr[i + 1].isSwapping = false
        arr[high].isSwapping = false
      }

      arr[i + 1].isPivot = false
      arr[i + 1].isSorted = true
      await updateArray(arr, `Pivot ${arr[i + 1].value} is now in final position`)

      return i + 1
    }

    const quickSortHelper = async (low: number, high: number) => {
      if (shouldStopRef.current) return
      if (low < high) {
        const pi = await partition(low, high)
        if (pi === -1) return // stopped

        await quickSortHelper(low, pi - 1)
        await quickSortHelper(pi + 1, high)
      } else if (low === high) {
        arr[low].isSorted = true
        await updateArray(arr, `Single element ${arr[low].value} is sorted`)
      }
    }

    await quickSortHelper(0, arr.length - 1)
    await updateArray(arr, 'Quick sort complete!')
  }

  const heapSort = async () => {
    const arr = [...array]
    const n = arr.length

    const heapify = async (n: number, i: number) => {
      if (shouldStopRef.current) return
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2

      if (left < n) {
        arr[largest].isComparing = true
        arr[left].isComparing = true
        await updateArray(arr, `Comparing ${arr[largest].value} with left child ${arr[left].value}`)
        setComparisons(prev => prev + 1)

        if (arr[left].value > arr[largest].value) {
          largest = left
        }
        arr[largest].isComparing = false
        arr[left].isComparing = false
      }

      if (right < n) {
        if (shouldStopRef.current) return
        arr[largest].isComparing = true
        arr[right].isComparing = true
        await updateArray(arr, `Comparing ${arr[largest].value} with right child ${arr[right].value}`)
        setComparisons(prev => prev + 1)

        if (arr[right].value > arr[largest].value) {
          largest = right
        }
        arr[largest].isComparing = false
        arr[right].isComparing = false
      }

      if (largest !== i) {
        if (shouldStopRef.current) return
        arr[i].isSwapping = true
        arr[largest].isSwapping = true
        await updateArray(arr, `Swapping ${arr[i].value} with ${arr[largest].value}`)

          ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
        setSwaps(prev => prev + 1)
        await updateArray(arr, 'Swapped!')

        arr[i].isSwapping = false
        arr[largest].isSwapping = false

        await heapify(n, largest)
      }
    }

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      if (shouldStopRef.current) return
      await heapify(n, i)
    }

    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
      if (shouldStopRef.current) return
      arr[0].isSwapping = true
      arr[i].isSwapping = true
      await updateArray(arr, `Moving max element ${arr[0].value} to sorted position`)

        ;[arr[0], arr[i]] = [arr[i], arr[0]]
      setSwaps(prev => prev + 1)

      arr[0].isSwapping = false
      arr[i].isSwapping = false
      arr[i].isSorted = true

      await updateArray(arr, `Element ${arr[i].value} is now in final position`)
      await heapify(i, 0)
    }

    if (arr.length > 0) {
      arr[0].isSorted = true
      await updateArray(arr, 'Heap sort complete!')
    }
  }

  const startSorting = async () => {
    if (isRunning) return

    setIsRunning(true)
    shouldStopRef.current = false
    setComparisons(0)
    setSwaps(0)

    try {
      switch (algorithm) {
        case 'bubble':
          await bubbleSort()
          break
        case 'selection':
          await selectionSort()
          break
        case 'insertion':
          await insertionSort()
          break
        case 'merge':
          await mergeSort()
          break
        case 'quick':
          await quickSort()
          break
        case 'heap':
          await heapSort()
          break
        default:
          setCurrentStep('Algorithm not implemented yet')
      }
    } catch (error) {
      console.error('Sorting interrupted:', error)
    }

    setIsRunning(false)
  }

  const stopSorting = () => {
    shouldStopRef.current = true
    setIsRunning(false)
    setCurrentStep('Sorting stopped')
  }

  const resetArray = () => {
    if (isRunning) return
    generateRandomArray()
  }

  useEffect(() => {
    generateRandomArray()
  }, [generateRandomArray])

  const getBarColor = (element: ArrayElement) => {
    if (element.isSorted) return 'bg-green-500'
    if (element.isPivot) return 'bg-yellow-500'
    if (element.isSwapping) return 'bg-red-500'
    if (element.isComparing) return 'bg-blue-500'
    return 'bg-purple-500'
  }

  const maxValue = Math.max(...array.map(el => el.value))

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Algorithm Visualizer</h2>
        <p className="text-white/60">Watch sorting algorithms come to life</p>
      </div>

      {/* Algorithm Info */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 max-w-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">{ALGORITHM_INFO[algorithm].name}</h3>
        <p className="text-sm text-white/60 mb-2">{ALGORITHM_INFO[algorithm].description}</p>
        <div className="flex space-x-4 text-xs">
          <span className="text-white/60">
            Time: <span className="text-sky-400 font-mono">{ALGORITHM_INFO[algorithm].timeComplexity}</span>
          </span>
          <span className="text-white/60">
            Space: <span className="text-sky-400 font-mono">{ALGORITHM_INFO[algorithm].spaceComplexity}</span>
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {/* Algorithm Selection */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ALGORITHM_INFO) as SortingAlgorithm[]).map((algo) => (
            <button
              key={algo}
              onClick={() => setAlgorithm(algo)}
              disabled={isRunning}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${algorithm === algo
                ? 'bg-sky-500/30 text-sky-400 border border-sky-500/30'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                } disabled:opacity-50`}
            >
              {ALGORITHM_INFO[algo].name}
            </button>
          ))}
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/60">Speed:</span>
          <input
            type="range"
            min="1"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            disabled={isRunning}
            className="w-20"
          />
          <span className="text-sm text-sky-400">{speed}</span>
        </div>

        {/* Array Size */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/60">Size:</span>
          <input
            type="range"
            min="5"
            max="50"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={isRunning}
            className="w-20"
          />
          <span className="text-sm text-sky-400">{arraySize}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={startSorting}
          disabled={isRunning}
          className="px-6 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors disabled:opacity-50 border border-sky-500/30"
        >
          {isRunning ? 'Sorting...' : 'Start Sort'}
        </button>
        <button
          onClick={stopSorting}
          disabled={!isRunning}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 border border-red-500/30"
        >
          Stop
        </button>
        <button
          onClick={resetArray}
          disabled={isRunning}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors disabled:opacity-50 border border-white/10"
        >
          Generate New Array
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xl font-bold text-sky-400">{comparisons}</div>
          <div className="text-sm text-white/60">Comparisons</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xl font-bold text-sky-400">{swaps}</div>
          <div className="text-sm text-white/60">Swaps</div>
        </div>
      </div>

      {/* Current Step */}
      {currentStep && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3 max-w-2xl text-center">
          <p className="text-sky-400 font-medium">{currentStep}</p>
        </div>
      )}

      {/* Array Visualization */}
      <div className="w-full max-w-6xl">
        <div className="flex items-end justify-center space-x-1 h-80 bg-black/20 rounded-lg p-4 border border-white/10">
          {array.map((element, index) => (
            <motion.div
              key={element.id}
              className={`${getBarColor(element)} rounded-t transition-colors duration-150 flex items-end justify-center relative`}
              style={{
                height: `${(element.value / maxValue) * 250}px`,
                width: `${Math.max(800 / arraySize - 2, 8)}px`,
                minWidth: '8px'
              }}
              layout
              transition={{ duration: 0.15 }}
            >
              {arraySize <= 20 && (
                <span className="text-white text-xs font-bold mb-1">
                  {element.value}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-white/60">Unsorted</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-white/60">Comparing</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-white/60">Swapping</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-white/60">Pivot/Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-white/60">Sorted</span>
        </div>
      </div>
    </div>
  )
}