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

type SortingAlgorithm = 'selection' | 'bubble' | 'insertion' | 'merge' | 'quick' | 'heap' | 'cycle' | 'threeWayMerge' | 'counting' | 'radix' | 'bucket' | 'pigeonhole' | 'intro' | 'tim'

const ALGORITHM_INFO = {
  selection: {
    name: 'Selection Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Finds the minimum element and places it at the beginning, then repeats for the remaining elements.'
  },
  bubble: {
    name: 'Bubble Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
  },
  insertion: {
    name: 'Insertion Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Builds the final sorted array one item at a time, inserting each element in its correct position.'
  },
  cycle: {
    name: 'Cycle Sort',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Minimizes the number of writes by placing each element directly to its correct position.'
  },
  merge: {
    name: 'Merge Sort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Divides the array into halves, sorts them separately, then merges them back together.'
  },
  threeWayMerge: {
    name: '3-Way Merge Sort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Divides array into three parts and merges them, reducing the tree height.'
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
  },
  counting: {
    name: 'Counting Sort',
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(k)',
    description: 'Counts occurrences of each value and uses arithmetic to determine positions.'
  },
  radix: {
    name: 'Radix Sort',
    timeComplexity: 'O(d × n)',
    spaceComplexity: 'O(n + k)',
    description: 'Sorts numbers digit by digit starting from least significant to most significant.'
  },
  bucket: {
    name: 'Bucket Sort',
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(n + k)',
    description: 'Distributes elements into buckets, sorts each bucket, then concatenates them.'
  },
  pigeonhole: {
    name: 'Pigeonhole Sort',
    timeComplexity: 'O(n + k)',
    spaceComplexity: 'O(k)',
    description: 'Uses pigeonhole principle to place elements in their correct positions.'
  },
  intro: {
    name: 'IntroSort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Hybrid of quicksort, heapsort, and insertion sort for optimal performance.'
  },
  tim: {
    name: 'TimSort',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Hybrid of merge sort and insertion sort, used in Python and Java.'
  }
}

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([])
  const [arraySize, setArraySize] = useState(20)
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('selection')
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [showCustomArrayModal, setShowCustomArrayModal] = useState(false)
  const [customArrayInput, setCustomArrayInput] = useState('')
  const [customArray, setCustomArray] = useState<number[]>([])
  const [rangeFrom, setRangeFrom] = useState(1)
  const [rangeTo, setRangeTo] = useState(100)
  const [rangeStep, setRangeStep] = useState(1)
  const [isSpeedEditing, setIsSpeedEditing] = useState(false)
  const [tempSpeed, setTempSpeed] = useState('50')

  // Add ref to track if sorting should stop
  const shouldStopRef = useRef(false)
  const startTimeRef = useRef<number>(0)

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
    setTimeElapsed(0)
    setCurrentStep('')
  }, [arraySize])

  const handleAddCustomNumber = () => {
    const num = parseInt(customArrayInput)
    if (!isNaN(num)) {
      setCustomArray([...customArray, num])
      setCustomArrayInput('')
    }
  }

  const handleRemoveCustomNumber = (index: number) => {
    setCustomArray(customArray.filter((_, i) => i !== index))
  }

  const handleGenerateRange = () => {
    const rangeArray: number[] = []
    for (let i = rangeFrom; i <= rangeTo; i += rangeStep) {
      rangeArray.push(i)
    }
    setCustomArray(rangeArray)
  }

  const handleSubmitCustomArray = () => {
    if (customArray.length > 0) {
      const newArray: ArrayElement[] = customArray.map((value, i) => ({
        value,
        id: `element-${i}`,
        isComparing: false,
        isSwapping: false,
        isSorted: false
      }))
      setArray(newArray)
      setArraySize(customArray.length)
      setComparisons(0)
      setSwaps(0)
      setTimeElapsed(0)
      setCurrentStep('')
      setShowCustomArrayModal(false)
      setCustomArray([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCustomNumber()
    }
  }

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
    // Speed: 1 = 3000ms per operation (slowest), 100 = 50ms per operation (fastest)
    const delay = 3000 - (speed - 1) * (2950 / 99)
    setTimeElapsed((Date.now() - startTimeRef.current) / 1000)
    return sleep(delay)
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

  const cycleSort = async () => {
    const arr = [...array]
    const n = arr.length

    for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
      if (shouldStopRef.current) return
      let item = arr[cycleStart].value

      let pos = cycleStart
      for (let i = cycleStart + 1; i < n; i++) {
        arr[i].isComparing = true
        await updateArray(arr, `Counting elements less than ${item}`)
        setComparisons(prev => prev + 1)
        if (arr[i].value < item) pos++
        arr[i].isComparing = false
      }

      if (pos === cycleStart) continue

      while (item === arr[pos].value) pos++

      if (pos !== cycleStart) {
        arr[cycleStart].isSwapping = true
        arr[pos].isSwapping = true
        await updateArray(arr, `Moving ${item} to position ${pos}`)
        const temp = arr[pos].value
        arr[pos].value = item
        item = temp
        setSwaps(prev => prev + 1)
        arr[cycleStart].isSwapping = false
        arr[pos].isSwapping = false
      }

      while (pos !== cycleStart) {
        if (shouldStopRef.current) return
        pos = cycleStart
        for (let i = cycleStart + 1; i < n; i++) {
          if (arr[i].value < item) pos++
        }

        while (item === arr[pos].value) pos++

        if (item !== arr[pos].value) {
          arr[pos].isSwapping = true
          await updateArray(arr, `Moving ${item} to position ${pos}`)
          const temp = arr[pos].value
          arr[pos].value = item
          item = temp
          setSwaps(prev => prev + 1)
          arr[pos].isSwapping = false
        }
      }
    }

    arr.forEach(el => el.isSorted = true)
    await updateArray(arr, 'Cycle sort complete!')
  }

  const threeWayMergeSort = async () => {
    const arr = [...array]

    const merge3 = async (low: number, mid1: number, mid2: number, high: number) => {
      if (shouldStopRef.current) return
      const temp: ArrayElement[] = []
      let i = low, j = mid1, k = mid2

      while (i < mid1 && j < mid2 && k <= high) {
        arr[i].isComparing = true
        arr[j].isComparing = true
        arr[k].isComparing = true
        await updateArray(arr, `3-way merge: comparing elements`)
        setComparisons(prev => prev + 2)

        if (arr[i].value <= arr[j].value && arr[i].value <= arr[k].value) {
          temp.push({ ...arr[i] })
          arr[i].isComparing = false
          i++
        } else if (arr[j].value <= arr[i].value && arr[j].value <= arr[k].value) {
          temp.push({ ...arr[j] })
          arr[j].isComparing = false
          j++
        } else {
          temp.push({ ...arr[k] })
          arr[k].isComparing = false
          k++
        }
      }

      while (i < mid1 && j < mid2) {
        if (arr[i].value <= arr[j].value) {
          temp.push({ ...arr[i++] })
        } else {
          temp.push({ ...arr[j++] })
        }
      }

      while (j < mid2 && k <= high) {
        if (arr[j].value <= arr[k].value) {
          temp.push({ ...arr[j++] })
        } else {
          temp.push({ ...arr[k++] })
        }
      }

      while (i < mid1 && k <= high) {
        if (arr[i].value <= arr[k].value) {
          temp.push({ ...arr[i++] })
        } else {
          temp.push({ ...arr[k++] })
        }
      }

      while (i < mid1) temp.push({ ...arr[i++] })
      while (j < mid2) temp.push({ ...arr[j++] })
      while (k <= high) temp.push({ ...arr[k++] })

      for (let idx = 0; idx < temp.length; idx++) {
        arr[low + idx] = temp[idx]
      }
      await updateArray(arr, `Merged 3 segments`)
    }

    const mergeSortRec = async (low: number, high: number) => {
      if (shouldStopRef.current) return
      if (high - low < 2) return

      const mid1 = low + Math.floor((high - low) / 3)
      const mid2 = low + 2 * Math.floor((high - low) / 3)

      await mergeSortRec(low, mid1)
      await mergeSortRec(mid1, mid2)
      await mergeSortRec(mid2, high)
      await merge3(low, mid1, mid2, high)
    }

    await mergeSortRec(0, arr.length)
    arr.forEach(el => el.isSorted = true)
    await updateArray(arr, '3-way merge sort complete!')
  }

  const countingSort = async () => {
    const arr = [...array]
    const n = arr.length
    const max = Math.max(...arr.map(e => e.value))
    const min = Math.min(...arr.map(e => e.value))
    const range = max - min + 1

    const count = new Array(range).fill(0)
    const output: ArrayElement[] = []

    for (let i = 0; i < n; i++) {
      arr[i].isComparing = true
      await updateArray(arr, `Counting occurrences of ${arr[i].value}`)
      count[arr[i].value - min]++
      arr[i].isComparing = false
    }

    for (let i = 1; i < range; i++) {
      count[i] += count[i - 1]
    }

    for (let i = n - 1; i >= 0; i--) {
      arr[i].isSwapping = true
      await updateArray(arr, `Placing ${arr[i].value} at position ${count[arr[i].value - min] - 1}`)
      output[count[arr[i].value - min] - 1] = { ...arr[i] }
      count[arr[i].value - min]--
      arr[i].isSwapping = false
    }

    for (let i = 0; i < n; i++) {
      arr[i] = output[i]
      arr[i].isSorted = true
    }
    await updateArray(arr, 'Counting sort complete!')
  }

  const radixSort = async () => {
    const arr = [...array]
    const max = Math.max(...arr.map(e => e.value))

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      if (shouldStopRef.current) return
      const output: ArrayElement[] = new Array(arr.length)
      const count = new Array(10).fill(0)

      for (let i = 0; i < arr.length; i++) {
        arr[i].isComparing = true
        await updateArray(arr, `Counting digit ${Math.floor(arr[i].value / exp) % 10} at position ${exp}`)
        count[Math.floor(arr[i].value / exp) % 10]++
        arr[i].isComparing = false
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1]
      }

      for (let i = arr.length - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i].value / exp) % 10
        arr[i].isSwapping = true
        await updateArray(arr, `Placing ${arr[i].value} based on digit ${digit}`)
        output[count[digit] - 1] = { ...arr[i] }
        count[digit]--
        arr[i].isSwapping = false
      }

      for (let i = 0; i < arr.length; i++) {
        arr[i] = output[i]
      }
      await updateArray(arr, `Sorted by digit at position ${exp}`)
    }

    arr.forEach(el => el.isSorted = true)
    await updateArray(arr, 'Radix sort complete!')
  }

  const bucketSort = async () => {
    const arr = [...array]
    const n = arr.length
    const max = Math.max(...arr.map(e => e.value))
    const min = Math.min(...arr.map(e => e.value))
    const bucketCount = Math.floor(Math.sqrt(n))
    const buckets: ArrayElement[][] = Array.from({ length: bucketCount }, () => [])

    for (let i = 0; i < n; i++) {
      arr[i].isComparing = true
      const bucketIndex = Math.floor(((arr[i].value - min) / (max - min + 1)) * bucketCount)
      await updateArray(arr, `Placing ${arr[i].value} in bucket ${bucketIndex}`)
      buckets[Math.min(bucketIndex, bucketCount - 1)].push({ ...arr[i] })
      arr[i].isComparing = false
    }

    let index = 0
    for (let i = 0; i < bucketCount; i++) {
      if (shouldStopRef.current) return
      buckets[i].sort((a, b) => a.value - b.value)

      for (const element of buckets[i]) {
        element.isSwapping = true
        arr[index] = element
        await updateArray(arr, `Placing ${element.value} from bucket ${i}`)
        element.isSwapping = false
        index++
      }
    }

    arr.forEach(el => el.isSorted = true)
    await updateArray(arr, 'Bucket sort complete!')
  }

  const pigeonholeSort = async () => {
    const arr = [...array]
    const n = arr.length
    const max = Math.max(...arr.map(e => e.value))
    const min = Math.min(...arr.map(e => e.value))
    const range = max - min + 1

    const holes: ArrayElement[][] = Array.from({ length: range }, () => [])

    for (let i = 0; i < n; i++) {
      arr[i].isComparing = true
      await updateArray(arr, `Placing ${arr[i].value} in hole ${arr[i].value - min}`)
      holes[arr[i].value - min].push({ ...arr[i] })
      arr[i].isComparing = false
    }

    let index = 0
    for (let i = 0; i < range; i++) {
      if (shouldStopRef.current) return
      for (const element of holes[i]) {
        element.isSwapping = true
        arr[index] = element
        await updateArray(arr, `Retrieving ${element.value} from hole ${i}`)
        element.isSwapping = false
        index++
      }
    }

    arr.forEach(el => el.isSorted = true)
    await updateArray(arr, 'Pigeonhole sort complete!')
  }

  const introSort = async () => {
    const arr = [...array]
    const maxDepth = Math.floor(Math.log2(arr.length)) * 2

    const insertionSortRange = async (low: number, high: number) => {
      for (let i = low + 1; i <= high; i++) {
        if (shouldStopRef.current) return
        const key = arr[i]
        let j = i - 1

        arr[i].isPivot = true
        await updateArray(arr, `Insertion sort: selecting ${arr[i].value}`)

        while (j >= low && arr[j].value > key.value) {
          arr[j].isComparing = true
          await updateArray(arr, `Comparing and shifting`)
          setComparisons(prev => prev + 1)
          arr[j + 1] = arr[j]
          arr[j].isComparing = false
          j--
        }

        arr[j + 1] = key
        arr[i].isPivot = false
      }
    }

    const introSortUtil = async (low: number, high: number, depth: number) => {
      if (shouldStopRef.current) return
      const size = high - low + 1

      if (size < 16) {
        await insertionSortRange(low, high)
        return
      }

      if (depth === 0) {
        // Switch to heap sort
        await heapSort()
        return
      }

      // Quick sort partition
      const pivot = arr[Math.floor((low + high) / 2)]
      pivot.isPivot = true
      await updateArray(arr, `IntroSort: pivot ${pivot.value}`)

      let i = low, j = high
      while (i <= j) {
        while (arr[i].value < pivot.value) i++
        while (arr[j].value > pivot.value) j--

        if (i <= j) {
          if (i !== j) {
            arr[i].isSwapping = true
            arr[j].isSwapping = true
            await updateArray(arr, `Swapping ${arr[i].value} and ${arr[j].value}`)
              ;[arr[i], arr[j]] = [arr[j], arr[i]]
            setSwaps(prev => prev + 1)
            arr[i].isSwapping = false
            arr[j].isSwapping = false
          }
          i++
          j--
        }
      }

      pivot.isPivot = false

      if (low < j) await introSortUtil(low, j, depth - 1)
      if (i < high) await introSortUtil(i, high, depth - 1)
    }

    await introSortUtil(0, arr.length - 1, maxDepth)
    arr.forEach(el => el.isSorted = true)
    await updateArray(arr, 'IntroSort complete!')
  }

  const timSort = async () => {
    const arr = [...array]
    const RUN = 32

    const insertionSortRange = async (left: number, right: number) => {
      for (let i = left + 1; i <= right; i++) {
        if (shouldStopRef.current) return
        const key = arr[i]
        let j = i - 1

        arr[i].isPivot = true
        await updateArray(arr, `Insertion sorting run: ${arr[i].value}`)

        while (j >= left && arr[j].value > key.value) {
          arr[j].isComparing = true
          setComparisons(prev => prev + 1)
          arr[j + 1] = arr[j]
          arr[j].isComparing = false
          j--
        }

        arr[j + 1] = key
        arr[i].isPivot = false
      }
    }

    const merge = async (left: number, mid: number, right: number) => {
      if (shouldStopRef.current) return
      const leftArr = arr.slice(left, mid + 1)
      const rightArr = arr.slice(mid + 1, right + 1)

      let i = 0, j = 0, k = left

      while (i < leftArr.length && j < rightArr.length) {
        await updateArray(arr, `TimSort merge: comparing elements`)
        setComparisons(prev => prev + 1)

        if (leftArr[i].value <= rightArr[j].value) {
          arr[k] = leftArr[i]
          i++
        } else {
          arr[k] = rightArr[j]
          j++
        }
        k++
      }

      while (i < leftArr.length) {
        arr[k] = leftArr[i]
        i++
        k++
      }

      while (j < rightArr.length) {
        arr[k] = rightArr[j]
        j++
        k++
      }
    }

    // Sort individual runs
    for (let start = 0; start < arr.length; start += RUN) {
      if (shouldStopRef.current) return
      const end = Math.min(start + RUN - 1, arr.length - 1)
      await insertionSortRange(start, end)
    }

    // Merge runs
    for (let size = RUN; size < arr.length; size *= 2) {
      if (shouldStopRef.current) return
      for (let left = 0; left < arr.length; left += 2 * size) {
        const mid = left + size - 1
        const right = Math.min(left + 2 * size - 1, arr.length - 1)

        if (mid < right) {
          await merge(left, mid, right)
        }
      }
    }

    arr.forEach(el => el.isSorted = true)
    await updateArray(arr, 'TimSort complete!')
  }

  const startSorting = async () => {
    if (isRunning) return

    setIsRunning(true)
    shouldStopRef.current = false
    setComparisons(0)
    setSwaps(0)
    setTimeElapsed(0)
    startTimeRef.current = Date.now()

    try {
      switch (algorithm) {
        case 'selection':
          await selectionSort()
          break
        case 'bubble':
          await bubbleSort()
          break
        case 'insertion':
          await insertionSort()
          break
        case 'cycle':
          await cycleSort()
          break
        case 'merge':
          await mergeSort()
          break
        case 'threeWayMerge':
          await threeWayMergeSort()
          break
        case 'quick':
          await quickSort()
          break
        case 'heap':
          await heapSort()
          break
        case 'counting':
          await countingSort()
          break
        case 'radix':
          await radixSort()
          break
        case 'bucket':
          await bucketSort()
          break
        case 'pigeonhole':
          await pigeonholeSort()
          break
        case 'intro':
          await introSort()
          break
        case 'tim':
          await timSort()
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
    return 'bg-gray-500'
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
      <div className="flex flex-col gap-4 items-center justify-center">
        {/* Algorithm Selection */}
        <div className="flex flex-wrap gap-2 justify-center">
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

        {/* Speed, Size, and Custom Array Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {/* Speed Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white/60">Speed:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isRunning}
              className="w-20"
            />
            {isSpeedEditing ? (
              <input
                type="number"
                min="1"
                max="100"
                value={tempSpeed}
                onChange={(e) => setTempSpeed(e.target.value)}
                onBlur={() => {
                  const val = Math.max(1, Math.min(100, parseInt(tempSpeed) || 50))
                  setSpeed(val)
                  setTempSpeed(val.toString())
                  setIsSpeedEditing(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = Math.max(1, Math.min(100, parseInt(tempSpeed) || 50))
                    setSpeed(val)
                    setTempSpeed(val.toString())
                    setIsSpeedEditing(false)
                  }
                }}
                autoFocus
                className="w-12 text-sm text-sky-400 bg-white/5 border border-sky-500/30 rounded px-2 py-1 focus:outline-none focus:border-sky-500"
              />
            ) : (
              <span
                className="text-sm text-sky-400 cursor-pointer hover:text-sky-300 transition-colors min-w-[3rem] text-center"
                onClick={() => {
                  if (!isRunning) {
                    setTempSpeed(speed.toString())
                    setIsSpeedEditing(true)
                  }
                }}
              >
                {speed}
              </span>
            )}
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

          {/* Custom Array Button */}
          <button
            onClick={() => setShowCustomArrayModal(true)}
            disabled={isRunning}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 border border-purple-500/30 text-sm"
          >
            Custom Array
          </button>
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
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xl font-bold text-sky-400">{comparisons}</div>
          <div className="text-sm text-white/60">Comparisons</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xl font-bold text-sky-400">{swaps}</div>
          <div className="text-sm text-white/60">Swaps</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xl font-bold text-sky-400">{timeElapsed.toFixed(2)}s</div>
          <div className="text-sm text-white/60">Time Elapsed</div>
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
        <div className="flex items-end justify-center space-x-1 h-80 bg-black/20 rounded-lg p-4 border border-white/10 relative">
          {array.map((element, index) => (
            <div key={`${element.id}-${index}`} className="flex flex-col items-center relative group">
              <motion.div
                className={`${getBarColor(element)} rounded-t transition-colors duration-150 relative`}
                style={{
                  height: `${(element.value / maxValue) * 250}px`,
                  width: `${Math.max(800 / arraySize - 2, 8)}px`,
                  minWidth: '8px'
                }}
                layout
                transition={{ duration: 0.15 }}
              >
                {/* Hover tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {element.value}
                </div>
              </motion.div>
              {/* Number below bar */}
              {arraySize <= 20 && (
                <span className="text-white/70 text-xs font-medium mt-1">
                  {element.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
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

      {/* Custom Array Modal */}
      <AnimatePresence>
        {showCustomArrayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCustomArrayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Custom Array</h3>

              {/* Manual Number Input */}
              <div className="mb-6">
                <label className="block text-white/70 mb-2 text-sm">Add Numbers Manually</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customArrayInput}
                    onChange={(e) => setCustomArrayInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a number and press Enter"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500/50"
                  />
                  <button
                    onClick={handleAddCustomNumber}
                    className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors border border-sky-500/30"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Generate Range */}
              <div className="mb-6">
                <label className="block text-white/70 mb-2 text-sm">Generate Array in Range</label>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">From:</span>
                    <input
                      type="number"
                      value={rangeFrom}
                      onChange={(e) => setRangeFrom(Number(e.target.value))}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">To:</span>
                    <input
                      type="number"
                      value={rangeTo}
                      onChange={(e) => setRangeTo(Number(e.target.value))}
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">Step:</span>
                    <input
                      type="number"
                      value={rangeStep}
                      onChange={(e) => setRangeStep(Number(e.target.value))}
                      min="1"
                      className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-sky-500/50"
                    />
                  </div>
                  <button
                    onClick={handleGenerateRange}
                    className="px-4 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors border border-purple-500/30 text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Array Display */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white/70 text-sm">Current Array</label>
                  <span className="text-sky-400 text-sm">Elements: {customArray.length}</span>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                  {customArray.length === 0 ? (
                    <p className="text-white/40 text-center">No elements added yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {customArray.map((num, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-sky-500/20 text-sky-400 px-3 py-1 rounded-lg border border-sky-500/30"
                        >
                          <span>{num}</span>
                          <button
                            onClick={() => handleRemoveCustomNumber(index)}
                            className="text-red-400 hover:text-red-300 transition-colors font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitCustomArray}
                  disabled={customArray.length === 0}
                  className="flex-1 px-6 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors border border-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Array
                </button>
                <button
                  onClick={() => {
                    setShowCustomArrayModal(false)
                    setCustomArray([])
                    setCustomArrayInput('')
                  }}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-colors border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}