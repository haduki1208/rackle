@fumihumi 君の README を参考にしました。ありがとう。

# Rackle

車椅子の利用者により便利に簡単に乗り換えをしてもらうためのアプリケーション。

![Image from Gyazo](https://i.gyazo.com/e121d72288f33b3ecb021da16ec2f68e.jpg)

本アプリは Wakamono Innovation Network2018 介護 IT ハッカソン にて発表した作品です。
概要：http://yokohama-youth.jp/win2018/?fbclid=IwAR35pfLZXddKamY7oYW9VAV_QPvhbbnPPhwRt58z21WMivjg0Q1mnNxOC5E

詳しくはコチラ

> https://docs.google.com/presentation/d/175LFjA2JW1qUSTWBQu6uOF_GKwIJWkaMcpWFi4G9ruM/edit?usp=sharing

---

### 技術面

- Expo + ReactNative
- API Express
- インフラ構成 EC2 + RDS

### メンバー構成

- ビジネスサイド（5 人）
  - アプリ構想の立案。企画
  - アプリのニーズヒアリングや、ユーザテスト等
  - ハッカソンにおける広報活動
- 開発者 (6 人)
  - @ymzk-jp
    - PM 兼 PL
    - ビジネスサイドとの開発チームのすり合わせとエンジニア視点でのアイデアの企画・立案
    - 設計やアプリ構想の検討
    - 動画編集
  - @10fuga-a
    - デザイナー
    - UI デザインのほか。ポスターやアイコン等作成
  - @fumihumi
    - 画面開発
    - 駅名や改札を選択する画面
    - 設計やアプリ構想の検討
    - 環境構築
  - @yamato3310
    - 画面開発
    - 地図を表示している画面
  - @itti1021
    - [API 開発](https://github.com/ISC-MakeIT/rackle_api_itti)
  - @haduki1208
    - 画面開発
    - 動画画面の開発
    - [expo/videoplayer](https://github.com/expo/videoplayer)をベースに編集 => [fork したリポジトリ](https://github.com/ISC-MakeIT/videoplayer)
      - 横画面での再生を前提にプログラムされていたため縦向きで流せるよう変更した
      - 画面タッチしたときに処理を動かしたかったためイベントハンドラを設定した
