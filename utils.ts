// web/src/features/polysphere/utils.ts
export type Board = number[][];
export const ROWS = 5, COLS = 11;
export const ALL_PIECES = Array.from({length:12}, (_,i)=>i+1);

// 3D 金字塔相关常量
export const PYRAMID_LAYERS = 5;
export const PYRAMID_LAYER_SIZES = [5, 4, 3, 2, 1]; // 各层大小: 5x5, 4x4, 3x3, 2x2, 1x1
export const TOTAL_PYRAMID_CELLS = 55; // 5x5 + 4x4 + 3x3 + 2x2 + 1x1 = 55

// 金字塔棋盘类型
export interface PyramidCell {
    layer: number;
    row: number;
    col: number;
    pieceId: number; // 0 表示空，>0 表示棋子ID
}

export type PyramidBoard = PyramidCell[][][]; // [layer][row][col]

// 求解器统计信息
export interface SolverStats {
    time: number;          // 毫秒
    nodesVisited: number;  // 访问的节点数
    backtracks: number;    // 回溯次数
    memoryUsage: number;   // 字节
}

// ========== 2D 棋盘函数 ==========

export function emptyBoard(): Board {
    return Array.from({length: ROWS}, ()=>Array.from({length: COLS}, ()=>0));
}

// rotations/flips applied to offsets
export function rotateOffsets(offsets: number[][], turns: 0|1|2|3): number[][] {
    let pts = offsets.map(([r,c])=>[r,c]);
    for (let t=0;t<turns;t++) {
        pts = pts.map(([r,c])=>[c, -r]);
        const minR = Math.min(...pts.map(p=>p[0])), minC = Math.min(...pts.map(p=>p[1]));
        pts = pts.map(([r,c])=>[r-minR, c-minC]);
    }
    return pts as number[][];
}

export function flipHOffsets(offsets: number[][]): number[][] {
    let pts = offsets.map(([r,c])=>[r, -c]);
    const minR = Math.min(...pts.map(p=>p[0])), minC = Math.min(...pts.map(p=>p[1]));
    return pts.map(([r,c])=>[r-minR, c-minC]);
}

export function canPlace(board: Board, offsets: number[][], r0: number, c0: number) {
    for (const [dr,dc] of offsets) {
        const r=r0+dr, c=c0+dc;
        if (r<0||r>=ROWS||c<0||c>=COLS) return false;
        if (board[r][c] !== 0) return false;
    }
    return true;
}

export function place(board: Board, offsets: number[][], r0: number, c0: number, pid: number): Board {
    const next = board.map(row=>row.slice());
    for (const [dr,dc] of offsets) next[r0+dr][c0+dc] = pid;
    return next;
}

export function erasePiece(board: Board, r: number, c: number): Board {
    const pid = board[r][c];
    if (pid<=0) return board;
    const next = board.map(row=>row.slice());
    const q: [number,number][] = [[r,c]];
    next[r][c]=0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (q.length) {
        const [rr,cc] = q.pop()!;
        for (const [dr,dc] of dirs) {
            const nr=rr+dr, nc=cc+dc;
            if (next[nr]?.[nc] === pid) { next[nr][nc]=0; q.push([nr,nc]); }
        }
    }
    return next;
}

export function piecesPresent(board: Board): Set<number> {
    const s = new Set<number>();
    for (const row of board) for (const v of row) if (v>0) s.add(v);
    return s;
}

export function remainingFromAllowed(allowed: number[], board: Board): number[] {
    const present = piecesPresent(board);
    return allowed.filter(id => !present.has(id));
}

// ========== 3D 金字塔函数 ==========

/**
 * 创建空的金字塔棋盘
 */
export function createEmptyPyramid(): PyramidBoard {
    const pyramid: PyramidBoard = [];
    
    for (let layer = 0; layer < PYRAMID_LAYERS; layer++) {
        const size = PYRAMID_LAYER_SIZES[layer];
        const layerBoard: PyramidCell[][] = [];
        
        for (let row = 0; row < size; row++) {
            const rowCells: PyramidCell[] = [];
            for (let col = 0; col < size; col++) {
                rowCells.push({
                    layer,
                    row,
                    col,
                    pieceId: 0, // 空
                });
            }
            layerBoard.push(rowCells);
        }
        
        pyramid.push(layerBoard);
    }
    
    return pyramid;
}

/**
 * 将金字塔棋盘转换为字符串键
 */
export function pyramidCellKey(layer: number, row: number, col: number): string {
    return `${layer},${row},${col}`;
}

/**
 * 将字符串键解析为金字塔坐标
 */
export function parsePyramidCellKey(key: string): [number, number, number] {
    const [layer, row, col] = key.split(',').map(Number);
    return [layer, row, col];
}

/**
 * 3D 坐标到线性索引的映射
 * Layer 0: indices 0-24 (5x5)
 * Layer 1: indices 25-40 (4x4)
 * Layer 2: indices 41-49 (3x3)
 * Layer 3: indices 50-53 (2x2)
 * Layer 4: index 54 (1x1)
 */
export function pyramidToIndex(layer: number, row: number, col: number): number {
    let startIndex = 0;
    for (let i = 0; i < layer; i++) {
        startIndex += PYRAMID_LAYER_SIZES[i] * PYRAMID_LAYER_SIZES[i];
    }
    return startIndex + row * PYRAMID_LAYER_SIZES[layer] + col;
}

/**
 * 线性索引到 3D 坐标的映射
 */
export function indexToPyramid(index: number): [number, number, number] {
    let remaining = index;
    for (let layer = 0; layer < PYRAMID_LAYERS; layer++) {
        const layerCells = PYRAMID_LAYER_SIZES[layer] * PYRAMID_LAYER_SIZES[layer];
        if (remaining < layerCells) {
            const row = Math.floor(remaining / PYRAMID_LAYER_SIZES[layer]);
            const col = remaining % PYRAMID_LAYER_SIZES[layer];
            return [layer, row, col];
        }
        remaining -= layerCells;
    }
    throw new Error(`Invalid pyramid index: ${index}`);
}

/**
 * 检查在金字塔中是否可以放置棋子
 */
export function canPlaceInPyramid(
    pyramid: PyramidBoard,
    offsets: number[][], // 2D 偏移量
    placement: {layer: number, row: number, col: number},
    orientationType: 'XY' | 'XZ' | 'YZ'
): boolean {
    const { layer, row, col } = placement;
    
    for (const [dr, dc] of offsets) {
        let targetLayer: number, targetRow: number, targetCol: number;
        
        switch (orientationType) {
            case 'XY': // 平铺在XY平面上
                targetLayer = layer;
                targetRow = row + dr;
                targetCol = col + dc;
                break;
            case 'XZ': // 垂直跨层 (Type 1): rows -> layers, columns -> X
                targetLayer = layer + dr;
                targetRow = row; // 固定的Y位置
                targetCol = col + dc;
                break;
            case 'YZ': // 垂直跨层 (Type 2): columns -> layers, rows -> X
                targetLayer = layer + dc;
                targetRow = row + dr;
                targetCol = col; // 固定的Y位置
                break;
            default:
                return false;
        }
        
        // 检查边界
        if (targetLayer < 0 || targetLayer >= PYRAMID_LAYERS) return false;
        const layerSize = PYRAMID_LAYER_SIZES[targetLayer];
        if (targetRow < 0 || targetRow >= layerSize) return false;
        if (targetCol < 0 || targetCol >= layerSize) return false;
        
        // 检查是否已被占用
        if (pyramid[targetLayer][targetRow][targetCol].pieceId !== 0) {
            return false;
        }
    }
    
    return true;
}

/**
 * 在金字塔中放置棋子
 */
export function placeInPyramid(
    pyramid: PyramidBoard,
    offsets: number[][],
    placement: {layer: number, row: number, col: number},
    orientationType: 'XY' | 'XZ' | 'YZ',
    pieceId: number
): PyramidBoard {
    const newPyramid = pyramid.map(layer => 
        layer.map(row => 
            row.map(cell => ({...cell}))
        )
    );
    
    const { layer, row, col } = placement;
    
    for (const [dr, dc] of offsets) {
        let targetLayer: number, targetRow: number, targetCol: number;
        
        switch (orientationType) {
            case 'XY':
                targetLayer = layer;
                targetRow = row + dr;
                targetCol = col + dc;
                break;
            case 'XZ':
                targetLayer = layer + dr;
                targetRow = row;
                targetCol = col + dc;
                break;
            case 'YZ':
                targetLayer = layer + dc;
                targetRow = row + dr;
                targetCol = col;
                break;
            default:
                continue;
        }
        
        newPyramid[targetLayer][targetRow][targetCol].pieceId = pieceId;
    }
    
    return newPyramid;
}

/**
 * 从金字塔中移除棋子
 */
export function erasePieceFromPyramid(pyramid: PyramidBoard, startLayer: number, startRow: number, startCol: number): PyramidBoard {
    const pieceId = pyramid[startLayer][startRow][startCol].pieceId;
    if (pieceId <= 0) return pyramid;
    
    const newPyramid = pyramid.map(layer => 
        layer.map(row => 
            row.map(cell => ({...cell}))
        )
    );
    
    // 广度优先搜索移除相连的同ID棋子
    const queue: [number, number, number][] = [[startLayer, startRow, startCol]];
    newPyramid[startLayer][startRow][startCol].pieceId = 0;
    
    // 6方向相邻：上下左右前后
    const directions = [
        [1, 0, 0], [-1, 0, 0], // 层间
        [0, 1, 0], [0, -1, 0], // 行间
        [0, 0, 1], [0, 0, -1]  // 列间
    ];
    
    while (queue.length > 0) {
        const [layer, row, col] = queue.pop()!;
        
        for (const [dl, dr, dc] of directions) {
            const newLayer = layer + dl;
            const newRow = row + dr;
            const newCol = col + dc;
            
            // 检查边界
            if (newLayer < 0 || newLayer >= PYRAMID_LAYERS) continue;
            const layerSize = PYRAMID_LAYER_SIZES[newLayer];
            if (newRow < 0 || newRow >= layerSize) continue;
            if (newCol < 0 || newCol >= layerSize) continue;
            
            // 检查是否为同一棋子
            if (newPyramid[newLayer][newRow][newCol].pieceId === pieceId) {
                newPyramid[newLayer][newRow][newCol].pieceId = 0;
                queue.push([newLayer, newRow, newCol]);
            }
        }
    }
    
    return newPyramid;
}

/**
 * 获取金字塔中已使用的棋子ID
 */
export function piecesPresentInPyramid(pyramid: PyramidBoard): Set<number> {
    const s = new Set<number>();
    
    for (let layer = 0; layer < PYRAMID_LAYERS; layer++) {
        for (let row = 0; row < PYRAMID_LAYER_SIZES[layer]; row++) {
            for (let col = 0; col < PYRAMID_LAYER_SIZES[layer]; col++) {
                const pieceId = pyramid[layer][row][col].pieceId;
                if (pieceId > 0) s.add(pieceId);
            }
        }
    }
    
    return s;
}

/**
 * 从允许的棋子列表中移除已使用的棋子
 */
export function remainingFromAllowedForPyramid(allowed: number[], pyramid: PyramidBoard): number[] {
    const present = piecesPresentInPyramid(pyramid);
    return allowed.filter(id => !present.has(id));
}

/**
 * 检查金字塔是否已填满
 */
export function isPyramidFull(pyramid: PyramidBoard): boolean {
    for (let layer = 0; layer < PYRAMID_LAYERS; layer++) {
        for (let row = 0; row < PYRAMID_LAYER_SIZES[layer]; row++) {
            for (let col = 0; col < PYRAMID_LAYER_SIZES[layer]; col++) {
                if (pyramid[layer][row][col].pieceId === 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * 计算金字塔的空单元格数
 */
export function emptyPyramidCells(pyramid: PyramidBoard): number {
    let count = 0;
    
    for (let layer = 0; layer < PYRAMID_LAYERS; layer++) {
        for (let row = 0; row < PYRAMID_LAYER_SIZES[layer]; row++) {
            for (let col = 0; col < PYRAMID_LAYER_SIZES[layer]; col++) {
                if (pyramid[layer][row][col].pieceId === 0) {
                    count++;
                }
            }
        }
    }
    
    return count;
}

/**
 * 生成所有可能的 3D 放置方式
 * 用于构建精确覆盖矩阵
 */
export function generateAllPyramidPlacements(
    pieceId: number,
    shapeOffsets: number[][]
): Array<{
    pieceId: number;
    placement: {layer: number, row: number, col: number};
    orientationType: 'XY' | 'XZ' | 'YZ';
    orientationIndex: number; // 2D 方向索引
    coveredCells: number[]; // 覆盖的线性索引
}> {
    const placements = [];
    
    // 生成所有 2D 方向（旋转 + 翻转）
    const orientations2D: number[][][] = [];
    
    // 添加原始方向
    orientations2D.push(shapeOffsets);
    
    // 添加旋转方向
    for (let turns = 1; turns < 4; turns++) {
        orientations2D.push(rotateOffsets(shapeOffsets, turns as 0|1|2|3));
    }
    
    // 添加翻转方向
    const flipped = flipHOffsets(shapeOffsets);
    orientations2D.push(flipped);
    
    for (let flipTurns = 1; flipTurns < 4; flipTurns++) {
        orientations2D.push(rotateOffsets(flipped, flipTurns as 0|1|2|3));
    }
    
    // 去重
    const uniqueOrientations = Array.from(
        new Map(orientations2D.map(offsets => [JSON.stringify(offsets), offsets])).values()
    );
    
    // 为每个方向生成所有可能的放置
    for (let orientationIndex = 0; orientationIndex < uniqueOrientations.length; orientationIndex++) {
        const offsets = uniqueOrientations[orientationIndex];
        
        // XY 方向（平铺）
        for (let layer = 0; layer < PYRAMID_LAYERS; layer++) {
            const layerSize = PYRAMID_LAYER_SIZES[layer];
            
            // 找到偏移量的边界
            const rows = offsets.map(([r]) => r);
            const cols = offsets.map(([, c]) => c);
            const minRow = Math.min(...rows);
            const maxRow = Math.max(...rows);
            const minCol = Math.min(...cols);
            const maxCol = Math.max(...cols);
            
            const height = maxRow - minRow + 1;
            const width = maxCol - minCol + 1;
            
            // 在层内滑动窗口
            for (let startRow = 0; startRow <= layerSize - height; startRow++) {
                for (let startCol = 0; startCol <= layerSize - width; startCol++) {
                    // 计算覆盖的单元格
                    const coveredCells = offsets.map(([dr, dc]) => 
                        pyramidToIndex(layer, startRow + dr, startCol + dc)
                    );
                    
                    placements.push({
                        pieceId,
                        placement: { layer, row: startRow, col: startCol },
                        orientationType: 'XY',
                        orientationIndex,
                        coveredCells
                    });
                }
            }
        }
        
        // XZ 方向（垂直跨层 Type 1）
        // rows -> layers, columns -> X
        const rows = offsets.map(([r]) => r);
        const cols = offsets.map(([, c]) => c);
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);
        
        const layerSpan = maxRow - minRow + 1;
        const width = maxCol - minCol + 1;
        
        for (let startLayer = 0; startLayer <= PYRAMID_LAYERS - layerSpan; startLayer++) {
            for (let yPos = 0; yPos < PYRAMID_LAYER_SIZES[startLayer]; yPos++) {
                for (let startCol = 0; startCol <= PYRAMID_LAYER_SIZES[startLayer] - width; startCol++) {
                    // 检查所有层是否都有足够的宽度
                    let valid = true;
                    for (let dl = 0; dl < layerSpan; dl++) {
                        const layerSize = PYRAMID_LAYER_SIZES[startLayer + dl];
                        if (startCol + width > layerSize) {
                            valid = false;
                            break;
                        }
                    }
                    
                    if (!valid) continue;
                    
                    // 计算覆盖的单元格
                    const coveredCells = offsets.map(([dr, dc]) => 
                        pyramidToIndex(startLayer + dr, yPos, startCol + dc)
                    );
                    
                    placements.push({
                        pieceId,
                        placement: { layer: startLayer, row: yPos, col: startCol },
                        orientationType: 'XZ',
                        orientationIndex,
                        coveredCells
                    });
                }
            }
        }
        
        // YZ 方向（垂直跨层 Type 2）
        // columns -> layers, rows -> X
        const layerSpan2 = maxCol - minCol + 1;
        const width2 = maxRow - minRow + 1;
        
        for (let startLayer = 0; startLayer <= PYRAMID_LAYERS - layerSpan2; startLayer++) {
            for (let startRow = 0; startRow <= PYRAMID_LAYER_SIZES[startLayer] - width2; startRow++) {
                for (let xPos = 0; xPos < PYRAMID_LAYER_SIZES[startLayer]; xPos++) {
                    // 检查所有层是否都有足够的宽度
                    let valid = true;
                    for (let dl = 0; dl < layerSpan2; dl++) {
                        const layerSize = PYRAMID_LAYER_SIZES[startLayer + dl];
                        if (startRow + width2 > layerSize) {
                            valid = false;
                            break;
                        }
                    }
                    
                    if (!valid) continue;
                    
                    // 计算覆盖的单元格
                    const coveredCells = offsets.map(([dr, dc]) => 
                        pyramidToIndex(startLayer + dc, startRow + dr, xPos)
                    );
                    
                    placements.push({
                        pieceId,
                        placement: { layer: startLayer, row: startRow, col: xPos },
                        orientationType: 'YZ',
                        orientationIndex,
                        coveredCells
                    });
                }
            }
        }
    }
    
    return placements;
}

/**
 * 从 2D 棋盘状态转换为金字塔棋盘
 * 注意：这是一个简化的转换，可能不适用于所有情况
 */
export function convert2DToPyramid(board2D: Board): PyramidBoard {
    const pyramid = createEmptyPyramid();
    
    // 将 5x11 的 2D 棋盘映射到 5 层的金字塔
    // 简单映射：将 2D 棋盘的每一行映射到金字塔的对应层
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const pieceId = board2D[r][c];
            if (pieceId > 0) {
                // 这是一个简化的映射，实际映射需要更复杂的逻辑
                // 这里只是将棋子放在金字塔的相应位置
                const layer = Math.min(r, PYRAMID_LAYERS - 1);
                const layerSize = PYRAMID_LAYER_SIZES[layer];
                const rowInLayer = Math.min(Math.floor(c / (COLS / layerSize)), layerSize - 1);
                const colInLayer = c % layerSize;
                
                if (pyramid[layer][rowInLayer][colInLayer].pieceId === 0) {
                    pyramid[layer][rowInLayer][colInLayer].pieceId = pieceId;
                }
            }
        }
    }
    
    return pyramid;
}

/**
 * 检查两个金字塔是否相同
 */
export function pyramidsEqual(pyramid1: PyramidBoard, pyramid2: PyramidBoard): boolean {
    for (let layer = 0; layer < PYRAMID_LAYERS; layer++) {
        for (let row = 0; row < PYRAMID_LAYER_SIZES[layer]; row++) {
            for (let col = 0; col < PYRAMID_LAYER_SIZES[layer]; col++) {
                if (pyramid1[layer][row][col].pieceId !== pyramid2[layer][row][col].pieceId) {
                    return false;
                }
            }
        }
    }
    return true;
}

/**
 * 克隆金字塔
 */
export function clonePyramid(pyramid: PyramidBoard): PyramidBoard {
    return pyramid.map(layer => 
        layer.map(row => 
            row.map(cell => ({...cell}))
        )
    );
}