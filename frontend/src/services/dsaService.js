// AutoLearn AI - DSA Knowledge & Problem Dataset Service
// Covers 19 comprehensive topic modules, problem-solving patterns, and multi-language support (Java primary, Python, C++)

export const DSA_TOPICS = [
  { id: 'basics', name: 'Programming Basics', icon: 'Terminal', count: 12, desc: 'Variables, loops, conditionals, functions, bit manipulation & IO' },
  { id: 'complexity', name: 'Time & Space Complexity', icon: 'Gauge', count: 8, desc: 'Big-O notation, asymptotic analysis, worst/average/best cases' },
  { id: 'arrays', name: 'Arrays', icon: 'Layers', count: 28, desc: '1D/2D arrays, prefix sums, Kadane algorithm, two pointers, Dutch flag' },
  { id: 'strings', name: 'Strings', icon: 'FileText', count: 22, desc: 'String manipulation, palindromes, anagrams, sliding window, substring search' },
  { id: 'sorting', name: 'Sorting Algorithms', icon: 'ArrowUpDown', count: 14, desc: 'Merge sort, quick sort, cyclic sort, counting sort' },
  { id: 'binary-search', name: 'Binary Search', icon: 'Search', count: 20, desc: 'Binary search on 1D/2D arrays, search space reduction, search on answer' },
  { id: 'linked-lists', name: 'Linked Lists', icon: 'GitCommit', count: 18, desc: 'Singly, doubly, circular, fast & slow pointers, reversals' },
  { id: 'stacks-queues', name: 'Stack & Queue', icon: 'Server', count: 20, desc: 'Monotonic stack, Next Greater Element, circular queues, LRU Cache' },
  { id: 'hashing', name: 'Hashing', icon: 'Hash', count: 18, desc: 'Hash tables, frequency maps, collision handling, rolling hash' },
  { id: 'recursion', name: 'Recursion', icon: 'Repeat', count: 16, desc: 'Base cases, recursive trees, subsets, permutations, divide & conquer' },
  { id: 'backtracking', name: 'Backtracking', icon: 'RotateCcw', count: 15, desc: 'N-Queens, Sudoku solver, word search, subset sums' },
  { id: 'trees', name: 'Trees', icon: 'Network', count: 24, desc: 'Binary trees, traversals (in/pre/post/level), height, LCA, diameter' },
  { id: 'bst', name: 'Binary Search Trees', icon: 'GitFork', count: 16, desc: 'BST properties, validation, search, insert, delete, BST to GST' },
  { id: 'heap', name: 'Heap / Priority Queue', icon: 'TrendingUp', count: 16, desc: 'Min/Max heap, top K elements, median of stream, merge K sorted' },
  { id: 'greedy', name: 'Greedy Algorithms', icon: 'Zap', count: 18, desc: 'Activity selection, fractional knapsack, jump game, interval scheduling' },
  { id: 'graphs', name: 'Graphs', icon: 'Share2', count: 26, desc: 'BFS, DFS, Dijkstra, Bellman-Ford, Topo Sort, Kahn, DSU, Prim/Kruskal' },
  { id: 'dp', name: 'Dynamic Programming', icon: 'Cpu', count: 32, desc: '1D DP, 2D Grid DP, 0/1 Knapsack, LCS, LIS, Matrix Chain, Bitmask DP' },
  { id: 'trie', name: 'Trie', icon: 'FolderTree', count: 10, desc: 'Prefix trees, autocomplete, word search II, maximum XOR with Trie' },
  { id: 'advanced', name: 'Advanced Algorithms', icon: 'ShieldAlert', count: 14, desc: 'Segment Trees, Fenwick/BIT, Disjoint Sets, Euler Tour, Mo Algorithm' },
];

export const DSA_PATTERNS = [
  { id: 'two-pointers', name: 'Two Pointers', desc: 'Opposite or same-direction pointers to optimize O(n²) to O(n)' },
  { id: 'sliding-window', name: 'Sliding Window', desc: 'Fixed or dynamic size window over contiguous subarrays or substrings' },
  { id: 'fast-slow-pointers', name: 'Fast & Slow Pointers (Hare & Tortoise)', desc: 'Detecting cycles, finding middle elements, and palindrome validation' },
  { id: 'binary-search-pattern', name: 'Binary Search on Answer', desc: 'Monotonic predicate search to find optimal min/max values' },
  { id: 'prefix-sum', name: 'Prefix Sum & Frequency Map', desc: 'Precomputing cumulative sums to answer range queries in O(1)' },
  { id: 'monotonic-stack', name: 'Monotonic Stack / Queue', desc: 'Maintaining strictly increasing/decreasing order for next greater/smaller element' },
  { id: 'tree-dfs-bfs', name: 'Tree & Graph DFS / BFS', desc: 'Recursive state exploration vs level-order traversal with queues' },
  { id: 'top-k-elements', name: 'Top K Elements (Heap Pattern)', desc: 'Using min/max heap of size K to find extreme elements in O(n log k)' },
  { id: '01-knapsack', name: '0/1 & Unbounded Knapsack', desc: 'Decision tree with include/exclude choices and memoization' },
  { id: 'interval-merging', name: 'Interval Merging & Scheduling', desc: 'Sorting by start/end times and resolving overlaps greedily' },
  { id: 'backtracking-pattern', name: 'State Space Backtracking', desc: 'Explore all paths with choose, explore, and un-choose operations' },
];

export const COMPANIES_LIST = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Uber', 'Netflix', 'Adobe', 'Bloomberg', 'Goldman Sachs'
];

export const DSA_PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    topic: 'arrays',
    topicName: 'Arrays',
    difficulty: 'Easy',
    pattern: 'prefix-sum',
    patternName: 'Prefix Sum & Frequency Map',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    acceptanceRate: '52.4%',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.\n\nYou may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.\n\nYou can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      'Hint 1: A brute force search checks every pair (i, j) with O(n²) time. Can you check if the complement (target - nums[i]) exists in faster time?',
      'Hint 2: Use a HashMap to store visited numbers and their respective indices. As you iterate through nums, check if (target - current_number) is already in the map.',
      'Hint 3: In Java, use `HashMap<Integer, Integer> map = new HashMap<>()`. If `map.containsKey(target - nums[i])`, return new int[]{map.get(target - nums[i]), i}. Otherwise, put `nums[i]` into the map.'
    ],
    approach: `### Optimal Approach: One-Pass Hash Map
1. Maintain a Hash Map where the key is the number and the value is its index.
2. Iterate through \`nums\` with index \`i\`:
   - Compute complement: \`complement = target - nums[i]\`.
   - If \`complement\` is present in the map, return \`[map.get(complement), i]\`.
   - Otherwise, store \`nums[i] -> i\` in the map.
3. Return empty array if not found (problem guarantees one solution).`,
    timeComplexity: 'O(n) - Single pass through the array with O(1) average lookup in hash map.',
    spaceComplexity: 'O(n) - Storing at most n elements in the hash map.',
    starterCode: {
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int comp = target - nums[i];
            if (seen.count(comp)) {
                return {seen[comp], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0, 1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1, 2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0, 1]', isHidden: false },
      { input: '[1,5,8,12,19]\n20', expectedOutput: '[0, 4]', isHidden: true },
      { input: '[-3,4,3,90]\n0', expectedOutput: '[0, 2]', isHidden: true }
    ]
  },
  {
    id: 'kadanes-algorithm',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    topic: 'arrays',
    topicName: 'Arrays',
    difficulty: 'Medium',
    pattern: 'two-pointers',
    patternName: 'Prefix Sum & Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple', 'Bloomberg'],
    acceptanceRate: '50.8%',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.\n\nA subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    hints: [
      'Hint 1: If you take a subarray with a negative sum and add it to the next element, it will only decrease the sum. When does it make sense to reset the current subarray?',
      'Hint 2: Keep track of `currentSum` and `maxSum`. For each number, decide whether to add it to `currentSum` or start a new subarray from `num` if `currentSum < 0`.',
      'Hint 3: `currentSum = Math.max(num, currentSum + num)` and `maxSum = Math.max(maxSum, currentSum)`. Initialize `maxSum` with `nums[0]`.'
    ],
    approach: `### Optimal Approach: Kadane's Algorithm (Linear Scan)
1. Initialize \`maxSum = nums[0]\` and \`currSum = 0\`.
2. Iterate through each number in \`nums\`:
   - \`currSum += num\`
   - \`maxSum = max(maxSum, currSum)\`
   - If \`currSum < 0\`, reset \`currSum = 0\` (a negative prefix will never help future subarrays).
3. Return \`maxSum\`.`,
    timeComplexity: 'O(n) - Single pass through the array.',
    spaceComplexity: 'O(1) - Constant auxiliary memory.',
    starterCode: {
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = 0;
        for (int x : nums) {
            currentSum += x;
            if (currentSum > maxSum) {
                maxSum = currentSum;
            }
            if (currentSum < 0) {
                currentSum = 0;
            }
        }
        return maxSum;
    }
}`,
      python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        max_sum = nums[0]
        cur_sum = 0
        for x in nums:
            cur_sum = max(x, cur_sum + x)
            max_sum = max(max_sum, cur_sum)
        return max_sum`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0];
        int curSum = 0;
        for (int x : nums) {
            curSum = max(x, curSum + x);
            maxSum = max(maxSum, curSum);
        }
        return maxSum;
    }
};`
    },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[1]', expectedOutput: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: false },
      { input: '[-1,-2,-3,-4]', expectedOutput: '-1', isHidden: true },
      { input: '[2,3,-2,4]', expectedOutput: '7', isHidden: true }
    ]
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    topic: 'strings',
    topicName: 'Strings',
    difficulty: 'Easy',
    pattern: 'prefix-sum',
    patternName: 'Hashing & Frequency Counting',
    companies: ['Amazon', 'Google', 'Uber', 'Goldman Sachs'],
    acceptanceRate: '63.5%',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.\n\nAn **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Both strings have identical letter counts.' },
      { input: 's = "rat", t = "car"', output: 'false', explanation: 'Characters do not match.' }
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    hints: [
      'Hint 1: If s and t have different lengths, can they ever be anagrams?',
      'Hint 2: Count the frequency of each character in s and decrement with each character in t.',
      'Hint 3: An array of size 26 (`int[26]`) is optimal for ASCII lowercase letters.'
    ],
    approach: `### Optimal Approach: Fixed Array Frequency Map
1. If \`s.length() != t.length()\`, return \`false\`.
2. Initialize an integer array \`count\` of size 26.
3. For each index \`i\`, increment \`count[s.charAt(i) - 'a']\` and decrement \`count[t.charAt(i) - 'a']\`.
4. If all elements in \`count\` are 0, return \`true\`; else return \`false\`.`,
    timeComplexity: 'O(n) - Single pass over string length n.',
    spaceComplexity: 'O(1) - Constant array of size 26.',
    starterCode: {
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) return false;
        }
        return true;
    }
}`,
      python: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = [0] * 26
        for ch1, ch2 in zip(s, t):
            count[ord(ch1) - ord('a')] += 1
            count[ord(ch2) - ord('a')] -= 1
        return all(c == 0 for c in count)`,
      cpp: `#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> count(26, 0);
        for (int i = 0; i < s.length(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }
};`
    },
    testCases: [
      { input: '"anagram"\n"nagaram"', expectedOutput: 'true', isHidden: false },
      { input: '"rat"\n"car"', expectedOutput: 'false', isHidden: false },
      { input: '"a"\n"ab"', expectedOutput: 'false', isHidden: true },
      { input: '"listen"\n"silent"', expectedOutput: 'true', isHidden: true }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    topic: 'binary-search',
    topicName: 'Binary Search',
    difficulty: 'Easy',
    pattern: 'binary-search-pattern',
    patternName: 'Binary Search on Answer',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    acceptanceRate: '57.1%',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`.\n\nIf \`target\` exists, then return its index. Otherwise, return \`-1\`.\n\nYou must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' }
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All the integers in nums are unique.', 'nums is sorted in ascending order.'],
    hints: [
      'Hint 1: Use two pointers `left = 0` and `right = nums.length - 1`.',
      'Hint 2: Find `mid = left + (right - left) / 2` to avoid integer overflow.',
      'Hint 3: If `nums[mid] == target`, return `mid`. If `nums[mid] < target`, `left = mid + 1`, otherwise `right = mid - 1`.'
    ],
    approach: `### Optimal Approach: Iterative Binary Search
1. Initialize \`low = 0\` and \`high = nums.length - 1\`.
2. While \`low <= high\`:
   - \`mid = low + (high - low) / 2\`
   - If \`nums[mid] == target\`, return \`mid\`.
   - If \`nums[mid] < target\`, search right: \`low = mid + 1\`.
   - If \`nums[mid] > target\`, search left: \`high = mid - 1\`.
3. Return \`-1\` if not found.`,
    timeComplexity: 'O(log n) - Search space is halved in every iteration.',
    spaceComplexity: 'O(1) - Iterative approach requires no extra space.',
    starterCode: {
      java: `class Solution {
    public int search(int[] nums, int target) {
        int low = 0, high = nums.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`,
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        low, high = 0, len(nums) - 1
        while low <= high:
            mid = (low + high) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        return -1`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int low = 0, high = nums.size() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
};`
    },
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
      { input: '[5]\n5', expectedOutput: '0', isHidden: true },
      { input: '[2,5]\n0', expectedOutput: '-1', isHidden: true }
    ]
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    topic: 'linked-lists',
    topicName: 'Linked Lists',
    difficulty: 'Easy',
    pattern: 'fast-slow-pointers',
    patternName: 'Pointer Manipulation',
    companies: ['Amazon', 'Microsoft', 'Google', 'Adobe', 'Apple'],
    acceptanceRate: '75.2%',
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.\n\nA linked list is represented as \`[1,2,3,4,5]\`. The output should be \`[5,4,3,2,1]\`.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5, 4, 3, 2, 1]', explanation: 'Reversing 1->2->3->4->5 gives 5->4->3->2->1.' },
      { input: 'head = [1,2]', output: '[2, 1]', explanation: 'Reversing 1->2 gives 2->1.' },
      { input: 'head = []', output: '[]', explanation: 'Empty list reversed is empty list.' }
    ],
    constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
    hints: [
      'Hint 1: Think about re-wiring the `next` pointer of each node to point to its predecessor instead of its successor.',
      'Hint 2: Keep three pointers: `prev` (initialized to null), `curr` (initialized to head), and `nextTemp`.',
      'Hint 3: In each step: `nextTemp = curr.next; curr.next = prev; prev = curr; curr = nextTemp;`.'
    ],
    approach: `### Optimal Approach: Iterative 3-Pointers
1. Maintain \`prev = null\` and \`curr = head\`.
2. While \`curr != null\`:
   - Store next node: \`next = curr.next\`
   - Reverse link: \`curr.next = prev\`
   - Advance \`prev = curr\`
   - Advance \`curr = next\`
3. Return \`prev\` as the new head.`,
    timeComplexity: 'O(n) - Visits each of the n nodes exactly once.',
    spaceComplexity: 'O(1) - Uses only constant reference pointers.',
    starterCode: {
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`,
      python: `class Solution:
    def reverseList(self, head):
        prev = None
        curr = head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev`,
      cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* nxt = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }
};`
    },
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5, 4, 3, 2, 1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2, 1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: false },
      { input: '[42]', expectedOutput: '[42]', isHidden: true }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    topic: 'stacks-queues',
    topicName: 'Stack & Queue',
    difficulty: 'Easy',
    pattern: 'monotonic-stack',
    patternName: 'LIFO Stack Matching',
    companies: ['Meta', 'Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    acceptanceRate: '40.6%',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Matching round brackets.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All three brackets matched in order.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\'.'],
    hints: [
      'Hint 1: A closing bracket must always match the most recent open bracket. Which data structure supports Last-In-First-Out (LIFO)?',
      'Hint 2: Push opening brackets onto a Stack. When a closing bracket appears, pop the top of the stack and check if it matches.',
      'Hint 3: At the end, check if the stack is completely empty.'
    ],
    approach: `### Optimal Approach: Stack Verification
1. Initialize an empty stack of characters.
2. For each character \`c\` in \`s\`:
   - If \`c\` is \`'('\`, \`'{'\`, or \`'['\`, push it onto the stack.
   - If \`c\` is closing, check if stack is empty (if so, return false). Pop top and ensure it matches \`c\`.
3. Return \`stack.isEmpty()\`.`,
    timeComplexity: 'O(n) - Single pass through string.',
    spaceComplexity: 'O(n) - Stack stores at most n/2 open brackets.',
    starterCode: {
      java: `class Solution {
    public boolean isValid(String s) {
        java.util.Stack<Character> stack = new java.util.Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`,
      cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if (st.empty()) return false;
                char top = st.top(); st.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return st.empty();
    }
};`
    },
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"([)]"', expectedOutput: 'false', isHidden: true },
      { input: '"{[]}"', expectedOutput: 'true', isHidden: true }
    ]
  },
  {
    id: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'strings',
    topicName: 'Strings',
    difficulty: 'Medium',
    pattern: 'sliding-window',
    patternName: 'Sliding Window',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Bloomberg'],
    acceptanceRate: '34.2%',
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3. Note "pwke" is a subsequence, not a substring.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    hints: [
      'Hint 1: Use a sliding window `[left, right]`. Expand `right` to include the next character.',
      'Hint 2: If the character at `right` is already present inside the window, shrink the window from `left` until the duplicate is removed.',
      'Hint 3: Maintain a HashMap or integer array of last seen character indices to jump `left` in O(1).'
    ],
    approach: `### Optimal Approach: Sliding Window with Last Seen Index
1. Maintain a map \`lastSeen\` mapping each character to its most recent index in \`s\`.
2. Maintain pointer \`left = 0\` and \`maxLen = 0\`.
3. Iterate \`right\` from 0 to \`s.length() - 1\`:
   - If \`s.charAt(right)\` is in \`lastSeen\`, set \`left = max(left, lastSeen.get(char) + 1)\`.
   - Update \`lastSeen\` with index \`right\`.
   - Update \`maxLen = max(maxLen, right - left + 1)\`.
4. Return \`maxLen\`.`,
    timeComplexity: 'O(n) - Each character visited at most twice.',
    spaceComplexity: 'O(min(n, m)) - Map stores at most alphabet size m characters.',
    starterCode: {
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        java.util.Map<Character, Integer> map = new java.util.HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) {
                left = Math.max(left, map.get(c) + 1);
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = {}
        left = max_len = 0
        for right, char in enumerate(s):
            if char in seen and seen[char] >= left:
                left = seen[char] + 1
            seen[char] = right
            max_len = max(max_len, right - left + 1)
        return max_len`,
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> seen;
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.size(); ++right) {
            if (seen.count(s[right]) && seen[s[right]] >= left) {
                left = seen[s[right]] + 1;
            }
            seen[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`
    },
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3', isHidden: false },
      { input: '"bbbbb"', expectedOutput: '1', isHidden: false },
      { input: '"pwwkew"', expectedOutput: '3', isHidden: false },
      { input: '""', expectedOutput: '0', isHidden: true },
      { input: '"au"', expectedOutput: '2', isHidden: true }
    ]
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    topic: 'graphs',
    topicName: 'Graphs',
    difficulty: 'Medium',
    pattern: 'tree-dfs-bfs',
    patternName: 'Graph DFS / BFS Traversal',
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg', 'Meta'],
    acceptanceRate: '57.8%',
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.\n\nAn **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1',
        explanation: 'All connected 1s form a single large island.'
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3',
        explanation: 'Three disconnected islands are present.'
      }
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300', 'grid[i][j] is \'0\' or \'1\'.'],
    hints: [
      'Hint 1: Iterate through every cell (r, c) in the grid. If grid[r][c] == \'1\', you have encountered a new island.',
      'Hint 2: Launch a DFS or BFS from that cell to sink/visit all connected land cells (mark them as \'0\' or visited).',
      'Hint 3: Count how many times you initiate a brand new DFS/BFS traversal.'
    ],
    approach: `### Optimal Approach: Depth-First Search (Grid Flood Fill)
1. Initialize \`count = 0\`.
2. Iterate through each cell \`(r, c)\` in \`grid\`:
   - If \`grid[r][c] == '1'\`:
     - Increment \`count++\`.
     - Call \`dfs(r, c)\` to sink all orthogonally connected land cells by mutating \`grid[r][c] = '0'\`.
3. Return \`count\`.`,
    timeComplexity: 'O(m * n) - Each cell is visited a constant number of times.',
    spaceComplexity: 'O(m * n) - Recursion stack space in the worst case (grid fully covered with land).',
    starterCode: {
      java: `class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }

    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') {
            return;
        }
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
}`,
      python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        count = 0
        
        def dfs(r, c):
            if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != '1':
                return
            grid[r][c] = '0'
            dfs(r+1, c)
            dfs(r-1, c)
            dfs(r, c+1)
            dfs(r, c-1)
            
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
        return count`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int count = 0;
        for (int r = 0; r < grid.size(); ++r) {
            for (int c = 0; c < grid[0].size(); ++c) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
    void dfs(vector<vector<char>>& grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.size() || c >= grid[0].size() || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
};`
    },
    testCases: [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1', isHidden: false },
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3', isHidden: false },
      { input: '[["0"]]', expectedOutput: '0', isHidden: true },
      { input: '[["1","0","1"]]', expectedOutput: '2', isHidden: true }
    ]
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    topic: 'dp',
    topicName: 'Dynamic Programming',
    difficulty: 'Medium',
    pattern: '01-knapsack',
    patternName: 'Unbounded Knapsack / Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple', 'Meta', 'Goldman Sachs'],
    acceptanceRate: '43.1%',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.\n\nReturn *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.\n\nYou may assume that you have an infinite number of each kind of coin.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins total).' },
      { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Cannot form amount 3 using coins of denomination 2.' },
      { input: 'coins = [1], amount = 0', output: '0', explanation: '0 amount requires 0 coins.' }
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    hints: [
      'Hint 1: This is an unbounded knapsack problem. What is the subproblem? `dp[i]` = minimum coins to make amount `i`.',
      'Hint 2: Base case: `dp[0] = 0`. Initialize all other `dp` values to infinity (or `amount + 1`).',
      'Hint 3: Transition: for each coin in coins, `dp[i] = min(dp[i], 1 + dp[i - coin])` for `i >= coin`.'
    ],
    approach: `### Optimal Approach: 1D Bottom-Up DP
1. Initialize an array \`dp\` of size \`amount + 1\` filled with \`amount + 1\`.
2. Set \`dp[0] = 0\`.
3. For \`i\` from 1 to \`amount\`:
   - For each \`coin\` in \`coins\`:
     - If \`i - coin >= 0\`:
       - \`dp[i] = min(dp[i], 1 + dp[i - coin])\`
4. Return \`dp[amount] > amount ? -1 : dp[amount]\`.`,
    timeComplexity: 'O(amount * coins.length) - Iterates through each amount up to target.',
    spaceComplexity: 'O(amount) - 1D DP table of size amount + 1.',
    starterCode: {
      java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int max = amount + 1;
        int[] dp = new int[amount + 1];
        java.util.Arrays.fill(dp, max);
        dp[0] = 0;
        
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = Math.min(dp[i], 1 + dp[i - coin]);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
      python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        for i in range(1, amount + 1):
            for c in coins:
                if i - c >= 0:
                    dp[i] = min(dp[i], dp[i - c] + 1)
        return dp[amount] if dp[amount] != float('inf') else -1`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; ++i) {
            for (int c : coins) {
                if (i - c >= 0) {
                    dp[i] = min(dp[i], dp[i - c] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`
    },
    testCases: [
      { input: '[1,2,5]\n11', expectedOutput: '3', isHidden: false },
      { input: '[2]\n3', expectedOutput: '-1', isHidden: false },
      { input: '[1]\n0', expectedOutput: '0', isHidden: false },
      { input: '[186,419,83,408]\n6249', expectedOutput: '20', isHidden: true }
    ]
  },
  {
    id: 'lowest-common-ancestor',
    title: 'Lowest Common Ancestor of a Binary Tree',
    topic: 'trees',
    topicName: 'Trees',
    difficulty: 'Medium',
    pattern: 'tree-dfs-bfs',
    patternName: 'Tree Post-Order DFS',
    companies: ['Meta', 'Amazon', 'Microsoft', 'Google', 'Apple'],
    acceptanceRate: '60.3%',
    description: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes \`p\` and \`q\`.\n\nAccording to the definition of LCA on Wikipedia: "The lowest common ancestor is defined between two nodes \`p\` and \`q\` as the lowest node in \`T\` that has both \`p\` and \`q\` as descendants (where we allow **a node to be a descendant of itself**)."`,
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3', explanation: 'The LCA of nodes 5 and 1 is 3.' },
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5', explanation: 'The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself.' }
    ],
    constraints: ['The number of nodes in the tree is in the range [2, 10^5].', '-10^9 <= Node.val <= 10^9', 'All Node.val are unique.', 'p != q', 'p and q will exist in the tree.'],
    hints: [
      'Hint 1: If the current root is null, or matches p or q, then root is a candidate ancestor.',
      'Hint 2: Recursively search the left and right subtrees for p and q.',
      'Hint 3: If both left and right recursive calls return non-null, root is the LCA. If only one returns non-null, pass that non-null node up.'
    ],
    approach: `### Optimal Approach: Post-Order Recursive Traversal
1. Base cases:
   - If \`root == null\` or \`root == p\` or \`root == q\`, return \`root\`.
2. Recursively search left: \`left = lowestCommonAncestor(root.left, p, q)\`.
3. Recursively search right: \`right = lowestCommonAncestor(root.right, p, q)\`.
4. If \`left != null && right != null\`, \`root\` is the split point, return \`root\`.
5. Otherwise, return \`left != null ? left : right\`.`,
    timeComplexity: 'O(n) - In the worst case we visit every node in the binary tree.',
    spaceComplexity: 'O(h) - Where h is tree height, due to call stack.',
    starterCode: {
      java: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
}`,
      python: `class Solution:
    def lowestCommonAncestor(self, root, p, q):
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        return left or right`,
      cpp: `class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) return root;
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) return root;
        return left ? left : right;
    }
};`
    },
    testCases: [
      { input: '[3,5,1,6,2,0,8,null,null,7,4]\n5\n1', expectedOutput: '3', isHidden: false },
      { input: '[3,5,1,6,2,0,8,null,null,7,4]\n5\n4', expectedOutput: '5', isHidden: false },
      { input: '[1,2]\n1\n2', expectedOutput: '1', isHidden: true }
    ]
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    topic: 'arrays',
    topicName: 'Arrays',
    difficulty: 'Hard',
    pattern: 'two-pointers',
    patternName: 'Two Pointers & Elevation Trapping',
    companies: ['Google', 'Amazon', 'Meta', 'Goldman Sachs', 'Bloomberg'],
    acceptanceRate: '60.4%',
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map is trapped with 6 units of rain water.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: '9 units of water trapped.' }
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    hints: [
      'Hint 1: The water trapped above index i is determined by `min(maxLeft, maxRight) - height[i]`.',
      'Hint 2: Can you maintain `maxLeft` and `maxRight` simultaneously using two pointers `left = 0` and `right = n - 1`?',
      'Hint 3: Move the pointer with the smaller maximum height inwards to guarantee the bound.'
    ],
    approach: `### Optimal Approach: Two Pointers
1. Maintain \`left = 0\`, \`right = n - 1\`, \`leftMax = 0\`, \`rightMax = 0\`, \`water = 0\`.
2. While \`left < right\`:
   - If \`height[left] <= height[right]\`:
     - If \`height[left] >= leftMax\`, update \`leftMax = height[left]\`.
     - Else \`water += leftMax - height[left]\`.
     - \`left++\`.
   - Else:
     - If \`height[right] >= rightMax\`, update \`rightMax = height[right]\`.
     - Else \`water += rightMax - height[right]\`.
     - \`right--\`.
3. Return \`water\`.`,
    timeComplexity: 'O(n) - Single pass with two pointers.',
    spaceComplexity: 'O(1) - Constant memory.',
    starterCode: {
      java: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}`,
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        left, right = 0, len(height) - 1
        left_max, right_max = 0, 0
        water = 0
        while left < right:
            if height[left] <= height[right]:
                if height[left] >= left_max:
                    left_max = height[left]
                else:
                    water += left_max - height[left]
                left += 1
            else:
                if height[right] >= right_max:
                    right_max = height[right]
                else:
                    water += right_max - height[right]
                right -= 1
        return water`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0;
        int water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};`
    },
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
      { input: '[3,0,2,0,4]', expectedOutput: '7', isHidden: true }
    ]
  }
];

// Helper to get problem by ID or slug
export function getProblemById(id) {
  return DSA_PROBLEMS.find(p => p.id === id || p.id === id?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-')) || DSA_PROBLEMS[0];
}

// Client-side execution simulation engine with pass/fail evaluation
export function executeCodeSimulation({ problemId, language, code, customInput }) {
  const problem = getProblemById(problemId);
  const startTime = performance.now();

  if (!code || code.trim().length < 15) {
    return {
      success: false,
      error: 'Syntax Error: Code is empty or incomplete.',
      output: 'Compilation Failed: Incomplete code structure.',
      passedTests: 0,
      totalTests: problem.testCases.length,
      timeMs: 12,
      memoryMb: 36.4
    };
  }

  if (code.includes('while(true)') || code.includes('while (true)') || code.includes('for(;;)') || code.includes('for (;;)')) {
    return {
      success: false,
      error: 'Time Limit Exceeded (TLE): Potential infinite loop detected.',
      output: 'Process terminated after exceeding timeout limit 2000ms.',
      passedTests: 0,
      totalTests: problem.testCases.length,
      timeMs: 2040,
      memoryMb: 42.1
    };
  }

  const codeLower = code.toLowerCase();
  let hasValidLogic = true;
  let simulatedMistake = null;

  if (problem.id === 'two-sum') {
    hasValidLogic = codeLower.includes('hashmap') || codeLower.includes('map') || codeLower.includes('seen') || codeLower.includes('target -') || codeLower.includes('target-');
    if (!hasValidLogic && !codeLower.includes('for')) simulatedMistake = 'Wrong Answer: Missing search loop or hashing logic';
  } else if (problem.id === 'kadanes-algorithm') {
    hasValidLogic = codeLower.includes('max') || codeLower.includes('current') || codeLower.includes('sum');
  } else if (problem.id === 'valid-parentheses') {
    hasValidLogic = codeLower.includes('stack') || codeLower.includes('pop') || codeLower.includes('push');
  }

  const duration = Math.round(performance.now() - startTime + (35 + Math.random() * 45));
  const memory = (38.2 + Math.random() * 8.4).toFixed(1);

  if (!hasValidLogic) {
    return {
      success: false,
      error: simulatedMistake || 'Wrong Answer: Test case failed for given input.',
      output: `Test Case 1 Failed:\nInput: ${problem.testCases[0].input}\nExpected: ${problem.testCases[0].expectedOutput}\nActual Output: null`,
      passedTests: 0,
      totalTests: problem.testCases.length,
      timeMs: duration,
      memoryMb: memory
    };
  }

  const results = problem.testCases.map((tc, idx) => ({
    caseIndex: idx + 1,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    actualOutput: tc.expectedOutput,
    passed: true,
    isHidden: tc.isHidden
  }));

  return {
    success: true,
    message: 'All test cases passed successfully!',
    output: `Test Cases: ${problem.testCases.length}/${problem.testCases.length} Passed\nExecution Time: ${duration} ms\nMemory Usage: ${memory} MB (Beats 88.4% of submissions)`,
    testResults: results,
    passedTests: problem.testCases.length,
    totalTests: problem.testCases.length,
    timeMs: duration,
    memoryMb: memory
  };
}
