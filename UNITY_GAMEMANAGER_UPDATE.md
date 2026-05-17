# Unity GameManager 수정 가이드

## 수정할 내용

`GameManager.cs` 파일에 다음 기능을 추가해야 합니다:

1. 게임 오버 시 점수(coin)를 Next.js로 전달
2. Next.js에서 최고 점수를 받아서 표시
3. 점수 제출 결과를 받아서 처리

## 수정된 GameManager.cs 코드

```csharp
using TMPro;
#if UNITY_EDITOR
using UnityEditor.Build;
#endif
using UnityEngine;
using UnityEngine.SceneManagement;
using System;

[Serializable]
public class ScoreResponse
{
    public string userId;
    public string nickname;
    public string profileImageUrl;
    public int? bestScore;
    public int? rank;
}

public class GameManager : MonoBehaviour
{
    void Start()
    {
        #if UNITY_EDITOR
        // UnityEditor 네임스페이스를 사용하는 코드
        Debug.Log("This code runs only in the editor.");
        #endif

        // 이 코드는 빌드에서도 실행됨
        Debug.Log("Game started");
    }

    public static GameManager instance = null;

    [SerializeField]
    private TextMeshProUGUI text;

    [SerializeField]
    private GameObject gameOverPanel;

    private int coin = 0;

    [HideInInspector]
    public bool isGameOver = false;
    
    void Awake(){
        if (instance == null) {
            instance = this;
        }
    }

    public void IncreaseCoin(){
        coin += 1;
        text.SetText(coin.ToString());

        if(coin % 20 == 0){
            Player player = FindObjectOfType<Player>();
            if(player != null){
                player.Upgrade();
            }
        }
    }

    public void SetGameOver(){
        isGameOver = true;
        EnemySpawner enemySpawner = FindObjectOfType<EnemySpawner>();
        if(enemySpawner != null){
            enemySpawner.StopEnemyRoutine();
        }

        // 게임 오버 시 점수를 Next.js로 전달
        SendScoreToNextJS(coin);

        Invoke("ShowGameOverPanel", 1f);
    }

    void ShowGameOverPanel(){
        gameOverPanel.SetActive(true);
    }

    public void PlayAgain(){
        SceneManager.LoadScene("SampleScene");
    }

    // Next.js로 점수 전달 (coin 값을 score로 전달)
    public void SendScoreToNextJS(int coin)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
            Application.ExternalCall("receiveScoreFromUnity", coin);
        #endif
    }

    // Next.js에서 최고 점수를 받는 콜백
    public void OnScoreReceived(string jsonData)
    {
        try
        {
            ScoreResponse response = JsonUtility.FromJson<ScoreResponse>(jsonData);
            Debug.Log($"최고 점수 받음: {response.bestScore}, 순위: {response.rank}");
            
            // 여기서 UI에 최고 점수를 표시할 수 있습니다
            // 예: 최고 점수 텍스트 업데이트
            if (response.bestScore.HasValue)
            {
                // 최고 점수를 표시하는 UI가 있다면 업데이트
                // 예: bestScoreText.SetText($"최고 점수: {response.bestScore.Value}");
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"점수 데이터 파싱 오류: {e.Message}");
        }
    }

    // Next.js에서 랭킹을 받는 콜백
    public void OnRankingReceived(string jsonData)
    {
        Debug.Log($"랭킹 데이터 받음: {jsonData}");
        // 랭킹 UI 업데이트
    }

    // 에러 처리 콜백
    public void OnScoreError(string errorMessage)
    {
        Debug.LogError($"점수 처리 오류: {errorMessage}");
    }
}
```

## 주요 변경 사항

1. **`SendScoreToNextJS(int score)` 메서드 추가**
   - 게임 오버 시 `SetGameOver()`에서 호출
   - `coin` 값을 Next.js로 전달

2. **`OnScoreReceived(string jsonData)` 메서드 추가**
   - Next.js에서 최고 점수를 받아서 처리
   - 게임 시작 시 자동으로 호출됨

3. **`OnRankingReceived(string jsonData)` 메서드 추가**
   - 랭킹 데이터를 받아서 처리

4. **`OnScoreError(string errorMessage)` 메서드 추가**
   - 에러 발생 시 처리

5. **`ScoreResponse` 클래스 추가**
   - JSON 데이터를 파싱하기 위한 클래스

## 사용 흐름

1. **게임 시작**: Next.js가 자동으로 최고 점수를 불러와서 `OnScoreReceived` 호출
2. **게임 플레이**: `coin` 변수로 점수 관리
3. **게임 오버**: `SetGameOver()` → `SendScoreToNextJS(coin)` → Next.js로 점수 전달
4. **점수 제출 완료**: Next.js가 결과를 받아서 `OnScoreReceived` 호출

## 참고사항

- `#if UNITY_WEBGL && !UNITY_EDITOR` 조건부 컴파일로 WebGL 빌드에서만 동작
- Unity 에디터에서는 `Application.ExternalCall`이 동작하지 않으므로 테스트는 WebGL 빌드로 해야 함
- JSON 파싱을 위해 `System` 네임스페이스 추가 필요
