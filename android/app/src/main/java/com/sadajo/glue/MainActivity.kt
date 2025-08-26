package com.sadajo.glue

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.os.Build
import android.os.Bundle
import android.util.Base64
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "GlueApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
      
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    getHashKey()
  }
  
  private fun getHashKey() {
    try {
      // Android API 28 이하와 이상에서 다른 방식으로 패키지 정보 가져오기
      val packageInfo: PackageInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
      } else {
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNATURES)
      }
      
      // 서명 정보 가져오기
      val signatures: Array<Signature>? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        packageInfo.signingInfo?.apkContentsSigners
      } else {
        @Suppress("DEPRECATION")
        packageInfo.signatures
      }
      
      if (signatures != null) {
        for (signature in signatures) {
          try {
            val md: MessageDigest = MessageDigest.getInstance("SHA")
            md.update(signature.toByteArray())
            val hashKey = Base64.encodeToString(md.digest(), Base64.NO_WRAP)
            Log.d("KeyHash", "Hash key: $hashKey")
          } catch (e: NoSuchAlgorithmException) {
            Log.e("KeyHash", "Unable to get MessageDigest. signature=$signature", e)
          }
        }
      } else {
        Log.e("KeyHash", "Signatures is null")
      }
    } catch (e: PackageManager.NameNotFoundException) {
      Log.e("KeyHash", "Unable to find package info", e)
    } catch (e: Exception) {
      Log.e("KeyHash", "Exception while getting hash key", e)
    }
  }
} 