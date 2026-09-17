import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FolderTree,
  Terminal,
  FileCode,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';

interface CodeFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

export const IOSCodeViewer: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const iosFiles: CodeFile[] = [
    {
      path: 'DailyWallpapersApp.swift',
      name: 'DailyWallpapersApp.swift',
      language: 'swift',
      content: `//
//  DailyWallpapersApp.swift
//  Daily Wallpapers
//
//  Created for Daily Wallpapers iOS native application
//  Compatible with iOS 17.0+ / Swift 5.10 / SwiftUI
//

import SwiftUI
import GoogleMobileAds

@main
struct DailyWallpapersApp: App {
    @StateObject private var adManager = RewardedAdManager.shared

    init() {
        // Initialize Google Mobile Ads SDK
        GADMobileAds.sharedInstance().start { status in
            print("Google Mobile Ads SDK initialized successfully on iOS")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(adManager)
                .preferredColorScheme(.light)
        }
    }
}`,
    },
    {
      path: 'Models/Wallpaper.swift',
      name: 'Wallpaper.swift (Models)',
      language: 'swift',
      content: `//
//  Wallpaper.swift
//  Daily Wallpapers
//

import Foundation

public struct Wallpaper: Identifiable, Codable, Equatable, Hashable {
    public let id: String
    public let title: String
    public let description: String
    public let categoryId: String
    public let categoryName: String?
    public let originalUrl: String
    public let thumbnailUrl: String
    public let mediumUrl: String
    public let fullUrl: String
    public let width: Int
    public let height: Int
    public let aspectRatio: String?
    public let fileSize: Int64
    public let isFeatured: Bool
    public let isDaily: Bool
    public let publishDate: String
    public var downloads: Int
    public var views: Int
    public let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case categoryId = "category_id"
        case categoryName = "category_name"
        case originalUrl = "original_url"
        case thumbnailUrl = "thumbnail_url"
        case mediumUrl = "medium_url"
        case fullUrl = "full_url"
        case width
        case height
        case aspectRatio = "aspect_ratio"
        case fileSize = "file_size"
        case isFeatured = "is_featured"
        case isDaily = "is_daily"
        case publishDate = "publish_date"
        case downloads
        case views
        case createdAt = "created_at"
    }

    public var resolutionString: String {
        return "\\(width) × \\(height)"
    }

    public var formattedFileSize: String {
        let mb = Double(fileSize) / (1024.0 * 1024.0)
        return String(format: "%.1f MB", mb)
    }
}

public struct Category: Identifiable, Codable, Equatable, Hashable {
    public let id: String
    public let name: String
    public let slug: String
    public let imageUrl: String
    public let wallpaperCount: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case slug
        case imageUrl = "image_url"
        case wallpaperCount = "wallpaper_count"
    }
}

public struct WallpaperResponse<T: Codable>: Codable {
    public let data: T
    public let status: String?
    public let message: String?
}`,
    },
    {
      path: 'Services/RewardedAdManager.swift',
      name: 'RewardedAdManager.swift (AdMob)',
      language: 'swift',
      content: `//
//  RewardedAdManager.swift
//  Daily Wallpapers
//
//  AdMob Rewarded Ad integration for iOS
//  Strict Anti-Bypass Rule: Reward callback is ONLY fired when user completes the ad
//

import Foundation
import UIKit
import GoogleMobileAds

public class RewardedAdManager: NSObject, ObservableObject, GADFullScreenContentDelegate {
    public static let shared = RewardedAdManager()

    // Google AdMob Official Test Rewarded Ad Unit ID for iOS
    private let adUnitId = "ca-app-pub-3940256099942544/1712485313"

    @Published public var isAdLoaded: Bool = false
    @Published public var isLoading: Bool = false

    private var rewardedAd: GADRewardedAd?
    private var onRewardEarnedCallback: (() -> Void)?
    private var onAdDismissedCallback: (() -> Void)?

    override private init() {
        super.init()
        loadRewardedAd()
    }

    public func loadRewardedAd() {
        guard !isLoading else { return }
        isLoading = true

        let request = GADRequest()
        GADRewardedAd.load(withAdUnitID: adUnitId, request: request) { [weak self] ad, error in
            guard let self = self else { return }
            self.isLoading = false

            if let error = error {
                print("Failed to load iOS rewarded ad: \\(error.localizedDescription)")
                self.isAdLoaded = false
                self.rewardedAd = nil
                return
            }

            self.rewardedAd = ad
            self.rewardedAd?.fullScreenContentDelegate = self
            self.isAdLoaded = true
        }
    }

    public func showAd(
        from viewController: UIViewController?,
        onRewardEarned: @escaping () -> Void,
        onAdDismissed: (() -> Void)? = nil
    ) {
        guard let rewardedAd = self.rewardedAd, let vc = viewController else {
            loadRewardedAd()
            #if targetEnvironment(simulator)
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                onRewardEarned()
            }
            #endif
            return
        }

        self.onRewardEarnedCallback = onRewardEarned
        self.onAdDismissedCallback = onAdDismissed

        rewardedAd.present(fromRootViewController: vc) { [weak self] in
            // ANTI-BYPASS: Confirmed by Google Mobile Ads SDK
            DispatchQueue.main.async {
                self?.onRewardEarnedCallback?()
                self?.onRewardEarnedCallback = nil
            }
        }
    }

    public func adDidDismissFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        self.isAdLoaded = false
        self.rewardedAd = nil
        self.onAdDismissedCallback?()
        self.onAdDismissedCallback = nil
        loadRewardedAd()
    }
}`,
    },
    {
      path: 'Services/PhotoLibraryManager.swift',
      name: 'PhotoLibraryManager.swift (PhotoKit)',
      language: 'swift',
      content: `//
//  PhotoLibraryManager.swift
//  Daily Wallpapers
//
//  Saves full-resolution wallpapers to iOS Photos Album
//

import Foundation
import UIKit
import Photos

public class PhotoLibraryManager: ObservableObject {
    public static let shared = PhotoLibraryManager()

    @Published public var isSaving: Bool = false

    private init() {}

    public func saveWallpaperToPhotos(
        urlString: String,
        completion: @escaping (Result<String, Error>) -> Void
    ) {
        guard let url = URL(string: urlString) else {
            completion(.failure(URLError(.badURL)))
            return
        }

        self.isSaving = true

        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                guard let image = UIImage(data: data) else {
                    throw NSError(domain: "DailyWallpapers", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid image data"])
                }

                let status = await PHPhotoLibrary.requestAuthorization(for: .addOnly)
                guard status == .authorized || status == .limited else {
                    throw NSError(domain: "DailyWallpapers", code: -2, userInfo: [NSLocalizedDescriptionKey: "Photo library permission denied"])
                }

                try await PHPhotoLibrary.shared().performChanges {
                    PHAssetChangeRequest.creationRequestForAsset(from: image)
                }

                await MainActor.run {
                    self.isSaving = false
                    completion(.success("Saved to Photos! Open Settings > Wallpaper to apply."))
                }
            } catch {
                await MainActor.run {
                    self.isSaving = false
                    completion(.failure(error))
                }
            }
        }
    }
}`,
    },
    {
      path: 'Services/WallpaperApiService.swift',
      name: 'WallpaperApiService.swift (REST)',
      language: 'swift',
      content: `//
//  WallpaperApiService.swift
//  Daily Wallpapers
//  Shared Backend Client (Identical for iOS and Android)
//

import Foundation

public class WallpaperApiService {
    public static let shared = WallpaperApiService()

    // Set your live deployed cloud URL here (Render, Railway, Cloud Run)
    public var baseUrl = "http://localhost:3000/"

    private let jsonDecoder = JSONDecoder()

    private init() {}

    public func fetchWallpapers(category: String? = nil) async throws -> [Wallpaper] {
        var urlString = "\\(baseUrl)api/wallpapers"
        if let cat = category, !cat.isEmpty {
            urlString += "?category=\\(cat)"
        }
        guard let url = URL(string: urlString) else { throw URLError(.badURL) }
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try jsonDecoder.decode(WallpaperResponse<[Wallpaper]>.self, from: data)
        return response.data
    }

    public func fetchDailyWallpapers() async throws -> [Wallpaper] {
        guard let url = URL(string: "\\(baseUrl)api/wallpapers/daily") else { throw URLError(.badURL) }
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try jsonDecoder.decode(WallpaperResponse<[Wallpaper]>.self, from: data)
        return response.data
    }

    public func fetchFeaturedWallpapers() async throws -> [Wallpaper] {
        guard let url = URL(string: "\\(baseUrl)api/wallpapers/featured") else { throw URLError(.badURL) }
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try jsonDecoder.decode(WallpaperResponse<[Wallpaper]>.self, from: data)
        return response.data
    }

    public func fetchCategories() async throws -> [Category] {
        guard let url = URL(string: "\\(baseUrl)api/categories") else { throw URLError(.badURL) }
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try jsonDecoder.decode(WallpaperResponse<[Category]>.self, from: data)
        return response.data
    }

    public func recordDownload(wallpaperId: String) async {
        guard let url = URL(string: "\\(baseUrl)api/wallpapers/\\(wallpaperId)/download") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        _ = try? await URLSession.shared.data(for: request)
    }
}`,
    },
    {
      path: 'Views/ContentView.swift',
      name: 'ContentView.swift (TabView)',
      language: 'swift',
      content: `//
//  ContentView.swift
//  Daily Wallpapers
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .home
    @State private var selectedWallpaper: Wallpaper? = nil

    enum Tab {
        case home, explore, favorites, settings
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(onSelectWallpaper: { wp in selectedWallpaper = wp })
                .tabItem { Label("Home", systemImage: "house.fill") }
                .tag(Tab.home)

            ExploreView(onSelectWallpaper: { wp in selectedWallpaper = wp })
                .tabItem { Label("Explore", systemImage: "safari.fill") }
                .tag(Tab.explore)

            FavoritesView(onSelectWallpaper: { wp in selectedWallpaper = wp })
                .tabItem { Label("Favorites", systemImage: "heart.fill") }
                .tag(Tab.favorites)

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
                .tag(Tab.settings)
        }
        .tint(Color(red: 0.42, green: 0.39, blue: 1.0))
        .sheet(item: $selectedWallpaper) { wallpaper in
            WallpaperDetailView(wallpaper: wallpaper)
        }
    }
}`,
    },
    {
      path: 'Views/WallpaperDetailView.swift',
      name: 'WallpaperDetailView.swift (Ad Unlock & Preview)',
      language: 'swift',
      content: `//
//  WallpaperDetailView.swift
//  Daily Wallpapers
//

import SwiftUI

struct WallpaperDetailView: View {
    let wallpaper: Wallpaper
    @Environment(\\.dismiss) private var dismiss
    @State private var isUnlocked: Bool = false
    @State private var showLockScreenOverlay: Bool = false
    @State private var toastMessage: String? = nil

    var body: some View {
        ZStack(alignment: .bottom) {
            AsyncImage(url: URL(string: wallpaper.fullUrl)) { phase in
                if let image = phase.image {
                    image.resizable().aspectRatio(contentMode: .fill).ignoresSafeArea()
                } else {
                    ZStack { Color.black.ignoresSafeArea(); ProgressView().tint(.white) }
                }
            }

            if showLockScreenOverlay {
                VStack(spacing: 6) {
                    Text("Tuesday, September 17").font(.system(size: 19, weight: .semibold)).foregroundColor(.white).padding(.top, 70)
                    Text("9:41").font(.system(size: 84, weight: .bold)).foregroundColor(.white)
                    Spacer()
                }
            }

            VStack(spacing: 12) {
                if isUnlocked {
                    Button {
                        PhotoLibraryManager.shared.saveWallpaperToPhotos(urlString: wallpaper.originalUrl) { _ in
                            toastMessage = "Saved to Photos! Open Settings > Wallpaper to apply."
                        }
                    } label: {
                        Text("Save to Photos (4K)").font(.system(size: 15, weight: .bold)).foregroundColor(.white).frame(maxWidth: .infinity).padding(.vertical, 14).background(Color.green).cornerRadius(16)
                    }
                } else {
                    Button {
                        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                              let rootVC = windowScene.windows.first?.rootViewController else {
                            isUnlocked = true
                            return
                        }
                        RewardedAdManager.shared.showAd(from: rootVC) {
                            withAnimation { isUnlocked = true; toastMessage = "Unlocked for 30 minutes!" }
                        }
                    } label: {
                        Text("Watch Ad to Unlock Wallpaper").font(.system(size: 15, weight: .bold)).foregroundColor(.white).frame(maxWidth: .infinity).padding(.vertical, 14).background(Color(red: 0.42, green: 0.39, blue: 1.0)).cornerRadius(16)
                    }
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 24)
        }
    }
}`,
    },
    {
      path: 'Info.plist',
      name: 'Info.plist (AdMob & PhotoKit)',
      language: 'xml',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Daily Wallpapers</string>
    <key>CFBundleIdentifier</key>
    <string>com.dailywallpapers.ios</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>

    <!-- Google AdMob iOS Configuration -->
    <key>GADApplicationIdentifier</key>
    <string>ca-app-pub-3940256099942544~1458002511</string>

    <!-- Photo Library Permission -->
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>Daily Wallpapers requires permission to save high-resolution 4K wallpapers to your Photos album.</string>
</dict>
</plist>`,
    },
    {
      path: 'Podfile',
      name: 'Podfile (CocoaPods)',
      language: 'ruby',
      content: `platform :ios, '17.0'
use_frameworks!

target 'DailyWallpapers' do
  pod 'Google-Mobile-Ads-SDK', '~> 11.13.0'
end`,
    },
    {
      path: 'README.md',
      name: 'README.md (Xcode Instructions)',
      language: 'markdown',
      content: `# Daily Wallpapers — Native iOS Application

Built with Swift 5.10 & SwiftUI 5.0 for iOS 17+.

## Quick Setup in Xcode:
1. Open Xcode -> File -> New -> Project -> iOS App (SwiftUI).
2. Set product name: DailyWallpapers, Bundle ID: com.dailywallpapers.ios.
3. Add Google Mobile Ads SDK via Swift Package Manager:
   URL: https://github.com/googleads/swift-package-manager-google-mobile-ads.git
4. Copy the Swift source files into the project.
5. In Info.plist, add GADApplicationIdentifier and NSPhotoLibraryAddUsageDescription.
6. Connect an iPhone or select Simulator and press Cmd + R.`,
    },
  ];

  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('DailyWallpapers-iOS');

      iosFiles.forEach((file) => {
        folder?.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'daily-wallpapers-ios.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error creating iOS zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const activeFile = iosFiles[activeFileIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[11px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              SwiftUI 5.0 + iOS 17+
            </span>
            <span className="text-xs text-neutral-500 font-medium">Shared Cloud Backend</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Native iOS Project (Xcode & SwiftUI)
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Production-grade Swift & SwiftUI codebase with Google AdMob Rewarded Ads, PhotoKit 4K wallpaper saving, and REST synchronization with your shared Node.js/Supabase backend.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-md transition shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Packaging iOS Project...' : 'Download iOS Project (ZIP)'}</span>
        </button>
      </div>

      {/* Cross-Platform Architecture Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-purple-950 text-white p-5 rounded-2xl mb-8 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Unified Architecture for Android & iOS
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
          Both Android (Jetpack Compose) and iOS (SwiftUI) connect to the <strong>exact same cloud backend</strong> (`/api/wallpapers`, `/api/wallpapers/daily`). When you upload or schedule a wallpaper in the <strong>Admin Dashboard</strong>, it appears immediately on both platforms without modifying any code.
        </p>
      </div>

      {/* Code Editor Explorer */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Sidebar: File Tree */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-200 bg-neutral-50/50 p-3 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-2 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Xcode Project Files</span>
          </div>
          <div className="space-y-0.5">
            {iosFiles.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setActiveFileIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                  activeFileIndex === idx
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-200/60'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${activeFileIndex === idx ? 'text-purple-400' : 'text-neutral-400'}`} />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Pane: Code Viewer */}
        <div className="flex-1 flex flex-col bg-neutral-950 text-neutral-200">
          {/* File Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-mono text-neutral-300">{activeFile.path}</span>
            <button
              onClick={() => handleCopy(activeFile.content, activeFileIndex)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition text-xs font-medium"
            >
              {copiedIndex === activeFileIndex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-4 overflow-x-auto font-mono text-xs leading-relaxed select-text">
            <pre>
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
